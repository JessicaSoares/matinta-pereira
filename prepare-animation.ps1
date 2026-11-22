# Prepare aligned, smaller animation atlases from the original game frames.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
public static class MatintaAtlas {
 public static void Build(string[] files,string output) {
  int left=int.MaxValue,top=int.MaxValue,right=0,bottom=0;
  foreach(string path in files) using(Bitmap source=new Bitmap(path)) {
   var area=new Rectangle(0,0,source.Width,source.Height);
   var data=source.LockBits(area,ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
   byte[] bytes=new byte[Math.Abs(data.Stride)*source.Height]; Marshal.Copy(data.Scan0,bytes,0,bytes.Length);
   for(int y=0;y<source.Height;y++) for(int x=0;x<source.Width;x++) if(bytes[y*Math.Abs(data.Stride)+x*4+3]>12) {left=Math.Min(left,x);top=Math.Min(top,y);right=Math.Max(right,x+1);bottom=Math.Max(bottom,y+1);}
   source.UnlockBits(data);
  }
  int columns=8,w=384,h=480;
  using(Bitmap atlas=new Bitmap(columns*w,((files.Length+columns-1)/columns)*h,PixelFormat.Format32bppArgb)) using(Graphics g=Graphics.FromImage(atlas)) {
   g.Clear(Color.Transparent);g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.CompositingQuality=CompositingQuality.HighQuality;g.PixelOffsetMode=PixelOffsetMode.HighQuality;
   float scale=Math.Min((w-12f)/(right-left),(h-12f)/(bottom-top));
   float dw=(right-left)*scale,dh=(bottom-top)*scale;
   for(int i=0;i<files.Length;i++) using(Bitmap source=new Bitmap(files[i])) g.DrawImage(source,new RectangleF((i%columns)*w+(w-dw)/2,(i/columns)*h+h-dh-6,dw,dh),new RectangleF(left,top,right-left,bottom-top),GraphicsUnit.Pixel);
   atlas.Save(output,ImageFormat.Png);
  }
 }
}
"@
$sitePath=Join-Path $PSScriptRoot '.'
$projectPath=Resolve-Path (Join-Path $PSScriptRoot '../..')
$animationPath=Join-Path $sitePath 'assets/animation'
New-Item -ItemType Directory -Force -Path $animationPath | Out-Null
$groups=@(@{Folder='MATINTA IDLE';Name='idle';Step=4},@{Folder='MATINTA TRANSFORMACAO';Name='transform';Step=1},@{Folder='CORUJA VOANDO';Name='flight';Step=1})
$manifest=@{}
foreach($group in $groups){
 $frames=@(Get-ChildItem -LiteralPath (Join-Path $projectPath $group.Folder) -Filter '*.png' | Sort-Object { [int]([regex]::Match($_.BaseName,'\d+$').Value) })
 $selected=@(for($i=0;$i -lt $frames.Count;$i+=$group.Step){$frames[$i].FullName})
 [MatintaAtlas]::Build([string[]]$selected,(Join-Path $animationPath ($group.Name+'.png')))
 $manifest[$group.Name]=@{count=$selected.Count;columns=8;width=384;height=480;src=('assets/animation/'+$group.Name+'.png')}
}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $animationPath 'manifest.json') -Encoding UTF8
Get-ChildItem -LiteralPath $animationPath | Select-Object Name,Length

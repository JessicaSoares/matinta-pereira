from pathlib import Path
exec(Path(__file__).with_name('qa-preview.py').read_text(encoding='utf-8').split('out=Path(__file__).parent')[0])
base=Path(__file__).parent
pages=json.load(urllib.request.urlopen('http://127.0.0.1:9226/json'))
c=CDP(next(p['webSocketDebuggerUrl'] for p in pages if p['type']=='page'))
c.call('Page.enable');c.call('Runtime.enable');c.call('Log.enable');c.call('Network.enable');c.call('Network.setCacheDisabled',{'cacheDisabled':True})
c.call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
c.call('Page.navigate',{'url':'http://127.0.0.1:8086/'})
time.sleep(1)
c.js('document.fonts.ready.then(()=>true)')
assert c.js("document.fonts.check('18px Fell') && document.fonts.check('18px Alegreya')")
for width,height in [(1440,1000),(390,844),(320,740),(768,1024)]:
 c.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<650})
 for section in ['#inicio','#historia','#formas','#assobio','#equipe','footer']:
  c.js("document.querySelector('"+section+"').scrollIntoView({behavior:'instant'})")
  time.sleep(.25)
  assert not c.js('document.documentElement.scrollWidth>innerWidth'),(width,section,'overflow')
  if section == '#formas':
   c.js('loadSprites().then(()=>true)')
   for _ in range(25):
    if c.js('spritesLoaded'):break
    time.sleep(.1)
   assert c.js('spritesLoaded'),'atlases not ready'
  if width in [1440,390] and section != 'footer':
   time.sleep(.6)
   name=section.replace('#','').replace('.','')
   data=c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']
   (base/('preview-autoral-'+str(width)+'-'+name+'.png')).write_bytes(base64.b64decode(data))
 print(str(width)+': five sections and footer without horizontal overflow')
c.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
c.js("document.querySelector('#assobio').scrollIntoView({behavior:'instant'})")
time.sleep(.3)
c.js("document.querySelector('.whistle-button').click()")
time.sleep(2)
assert float(c.js("getComputedStyle(document.querySelector('.house-lit')).opacity"))>.99
assert c.js("document.querySelector('.response').textContent.includes('janela')")
assert c.js("getComputedStyle(document.querySelector('.house-response')).opacity")=='1'
data=c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']
(base/'preview-autoral-house-response.png').write_bytes(base64.b64decode(data))
c.js("document.querySelector('.sound').click()")
time.sleep(.1)
assert c.js("document.querySelector('.sound').getAttribute('aria-pressed')")=='true'
c.js("document.querySelector('#formas').scrollIntoView({behavior:'instant'})")
time.sleep(.3)
c.js("document.querySelector('[data-form=bird]').click()")
time.sleep(.2)
assert c.js('currentForm')==1
assert c.js("document.querySelector('.transformation').classList.contains('frames-ready')")
c.js("document.querySelector('.motion').click()")
time.sleep(.3)
assert c.js('reduced') and c.js('animationFrame===null')
c.js("document.querySelector('.mobile-menu').open=true;document.querySelector('.mobile-menu a').click()")
assert not c.js("document.querySelector('.mobile-menu').open")
assert c.js('Promise.all([...document.images].map(i=>{const probe=new Image();probe.src=i.src;return probe.decode().then(()=>true,()=>false)})).then(a=>a.every(Boolean))')
assert not c.errors,c.errors
print('Local fonts, animation atlases, form selector, house response, audio, reduced motion, mobile menu and image decoding passed; Console: no errors')
# Leave the test browser running for any visual corrections.

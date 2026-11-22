import base64, hashlib, json, os, socket, struct, time, urllib.request
from pathlib import Path

class CDP:
    def __init__(self, url):
        from urllib.parse import urlsplit
        u=urlsplit(url)
        self.s=socket.create_connection((u.hostname,u.port),10)
        self.s.settimeout(15)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall(('GET '+u.path+' HTTP/1.1\r\nHost: localhost:9226\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: '+key+'\r\nSec-WebSocket-Version: 13\r\nOrigin: http://localhost:9226\r\n\r\n').encode())
        data=b''
        while b'\r\n\r\n' not in data: data+=self.s.recv(1)
        assert b'101' in data,data
        self.n=0; self.errors=[]
    def read(self,n):
        data=b''
        while len(data)<n:
            chunk=self.s.recv(n-len(data))
            if not chunk: raise EOFError()
            data+=chunk
        return data
    def call(self,method,params=None):
        self.n+=1; ident=self.n
        data=json.dumps({'id':ident,'method':method,'params':params or {}}).encode()
        mask=os.urandom(4); size=len(data)
        header=bytes([129,128|size]) if size<126 else bytes([129,254])+struct.pack('!H',size)
        self.s.sendall(header+mask+bytes(x^mask[i%4] for i,x in enumerate(data)))
        while True:
            a,b=self.read(2); size=b&127
            if size==126:size=struct.unpack('!H',self.read(2))[0]
            elif size==127:size=struct.unpack('!Q',self.read(8))[0]
            packet=json.loads(self.read(size))
            if packet.get('method') in ['Runtime.exceptionThrown','Log.entryAdded']:
                if packet.get('method')=='Runtime.exceptionThrown' or packet.get('params',{}).get('entry',{}).get('level')=='error':self.errors.append(packet)
            if packet.get('id')==ident:
                if 'error' in packet:raise RuntimeError(packet['error'])
                return packet.get('result',{})
    def js(self,code):
        result=self.call('Runtime.evaluate',{'expression':code,'returnByValue':True,'awaitPromise':True,'userGesture':True})
        if 'exceptionDetails' in result:raise RuntimeError(result)
        return result.get('result',{}).get('value')

out=Path(__file__).parent
pages=json.load(urllib.request.urlopen('http://127.0.0.1:9226/json'))
c=CDP(next(p['webSocketDebuggerUrl'] for p in pages if p['type']=='page'))
c.call('Page.enable');c.call('Runtime.enable');c.call('Log.enable');c.call('Network.enable');c.call('Network.setCacheDisabled',{'cacheDisabled':True})
c.call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
c.call('Page.navigate',{'url':'http://127.0.0.1:8086/'})
time.sleep(3)
c.js('document.fonts.ready.then(()=>true)')
print('desktop',c.js('({title:document.title,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})'))
def screenshot(name):
    data=c.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})['data']
    (out/name).write_bytes(base64.b64decode(data))
screenshot('preview-desktop.png')
c.js("document.querySelector('#formas').scrollIntoView({behavior:'instant'})")
time.sleep(.5)
c.js("document.querySelector('[data-form=bird]').click()")
time.sleep(.2)
print('bird button',c.js("({name:document.querySelector('.form-name').textContent,value:document.querySelector('.transformation').style.getPropertyValue('--form')})"))
screenshot('preview-transformation.png')
c.js("window.scrollBy({top:600,behavior:'instant'})")
time.sleep(.3)
print('scroll form',c.js("document.querySelector('.transformation').style.getPropertyValue('--form')"))
c.js("document.querySelector('.whistle-button').click()")
print('whistle',c.js("({response:document.querySelector('.response').textContent,active:document.querySelector('.whistle').classList.contains('calling')})"))
c.js("document.querySelector('.sound').click()")
time.sleep(.3)
print('sound',c.js("document.querySelector('.sound').getAttribute('aria-pressed')"))
c.js("document.querySelector('.motion').click()")
time.sleep(.2)
print('reduced',c.js("({enabled:document.documentElement.classList.contains('reduced-motion'),form:document.querySelector('.transformation').style.getPropertyValue('--form')})"))
c.call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
c.js("window.scrollTo({top:0,behavior:'instant'})")
time.sleep(.5)
print('mobile',c.js('({overflow:document.documentElement.scrollWidth>innerWidth,width:innerWidth})'))
screenshot('preview-mobile.png')
c.js("document.querySelector('#formas').scrollIntoView({behavior:'instant'})")
time.sleep(.3)
c.js("document.querySelector('[data-form=bird]').click()")
time.sleep(.3)
screenshot('preview-mobile-forms.png')
c.call('Emulation.setDeviceMetricsOverride',{'width':1440,'height':1000,'deviceScaleFactor':1,'mobile':False})
for selector,name in [('#historia','preview-story.png'),('#assobio','preview-whistle.png')]:
    c.js("document.querySelector('"+selector+"').scrollIntoView({behavior:'instant'})")
    time.sleep(.5)
    screenshot(name)
print('all images loaded',c.js('Promise.all([...document.images].map(i=>i.decode().then(()=>true,()=>false))).then(a=>a.every(Boolean))'))
print('sound enabled',c.js("document.querySelector('.sound').getAttribute('aria-pressed')"))
print('console errors',json.dumps(c.errors))
c.call('Browser.close')

#!/usr/bin/env python3
"""HELIOS narrative concept video trilogy.

Generate 3 original motion-design trailers (MP4 + WAV score) from procedural
planet/cloud art, vectors, typography and original synthesized music.
No paid services, third-party photographs, fonts bundled, or fictional gameplay footage.
Requires Python 3 + Pillow + numpy + system ffmpeg, available on GitHub Actions Ubuntu.

Usage: python render_promos.py [--clip lite|mobile|pc|all] [--preview]
"""
from __future__ import annotations
import argparse, math, os, random, subprocess, wave
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

OUT=Path(__file__).resolve().parent
FPS=20
FONT_REG='/usr/share/fonts/opentype/inter/InterDisplay-Regular.otf'
FONT_BOLD='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
if not Path(FONT_REG).exists():
    import subprocess as sp
    FONT_REG=sp.check_output(['fc-match','-f','%{file}','Inter:style=Regular']).decode()
    FONT_BOLD=sp.check_output(['fc-match','-f','%{file}','Inter:style=Bold']).decode()
FONT_CACHE={}
def font(px,bold=True):
    k=(px,bold)
    if k not in FONT_CACHE: FONT_CACHE[k]=ImageFont.truetype(FONT_BOLD if bold else FONT_REG,px)
    return FONT_CACHE[k]

def clamp(v,a=0,b=1):return max(a,min(b,v))
def smooth(v):
    x=clamp(v);return x*x*(3-2*x)
def mix(a,b,t):return a+(b-a)*t

def paper_texture(w,h,seed=13):
    rng=np.random.default_rng(seed)
    # Deep blue-black with subtle burnt-amber sidelight.
    yy=np.linspace(0,1,h,dtype=np.float32)[:,None]
    xx=np.linspace(0,1,w,dtype=np.float32)[None,:]
    light=np.exp(-((xx-.82)**2/.2+(yy-.17)**2/.32))*1.0
    grain=rng.normal(0,1.9,(h,w)).astype(np.float32)
    channels=[]
    for base,amp,grad in ((7,31,10),(16,20,8),(29,15,3)):
        arr=base+amp*light+grad*(1-yy)+grain
        channels.append(np.clip(arr,0,255).astype('uint8'))
    return Image.fromarray(np.stack(np.broadcast_arrays(*channels),axis=-1),'RGB').convert('RGBA')

def make_planet(diameter=900,seed=7):
    ys,xs=np.mgrid[0:diameter,0:diameter].astype(np.float32)
    x=(xs/(diameter-1)*2-1);y=(ys/(diameter-1)*2-1)
    radius=x*x+y*y
    mask=radius<=1
    z=np.sqrt(np.maximum(0,1-radius))
    # stylised Venus sulphuric cloud bands; planetary mesh shading, not a real NASA image.
    bend=3.0*np.sin(x*4+y*1.2)+1.2*np.cos(y*10-x*3)
    bands=np.sin(y*30+x*9+bend)+.48*np.sin(y*63-x*7+1.5*np.sin(x*17))
    micro=.35*np.sin(y*117+x*29+3*np.sin(x*22+y*4))
    tone=np.clip((bands+micro)/3.2,-1,1)
    sun=np.maximum(0,.30+ .78*z - .50*x + .13*(-y))
    rim=np.clip((z-.005)/.06,0,1)
    r=np.clip((202+34*tone)*sun+16,0,255)
    g=np.clip((127+24*tone)*sun+9,0,255)
    b=np.clip((83+13*tone)*sun+12,0,255)
    a=np.where(mask,(255*rim).astype('uint8'),0)
    im=Image.fromarray(np.stack((r.astype('uint8'),g.astype('uint8'),b.astype('uint8'),a),-1),'RGBA')
    return im

PLANET=make_planet()

def make_cloud_layer(w,h,shade=(162,100,83),seed=17):
    yy=np.linspace(0,1,h,dtype=np.float32)[:,None]
    xx=np.linspace(0,1,w,dtype=np.float32)[None,:]
    ripples=np.sin(xx*17+np.sin(yy*11))*0.5+np.sin(xx*6-yy*15)*0.3
    fog=np.maximum(0,np.sin((yy-.34)*5+1.0)+ripples*.28)
    out=[]
    for i,ch in enumerate(shade):out.append(np.clip(ch+40*fog-48*yy+5*np.cos(xx*7+i),0,255).astype('uint8'))
    alpha=np.clip((yy-.27)*300+fog*24,0,210).astype('uint8')
    return Image.fromarray(np.stack([np.broadcast_to(q,(h,w)) for q in out+[alpha]],-1),'RGBA')

SPECS={
'lite':dict(title='HELIOS · ДОСЬЕ ВЕНЕРЫ',w=720,h=1280,duration=18.0,vertical=True,accent=(242,171,112),filename='HELIOS_Lite_Dossier_9x16.mp4',slug='Lite',desc='Архивы. Экспедиция. Опасное открытие.'),
'mobile':dict(title='HELIOS · ОБЛАЧНАЯ СЛУЖБА',w=720,h=1280,duration=18.0,vertical=True,accent=(118,216,215),filename='HELIOS_Mobile_Cloud_Service_9x16.mp4',slug='Mobile',desc='Экипажи. Логистика. Облачный фронтир.'),
'pc':dict(title='HELIOS · БОЛЬШАЯ СТРАТЕГИЯ',w=960,h=540,duration=20.0,vertical=False,accent=(248,193,117),filename='HELIOS_PC_Civilization_16x9.mp4',slug='PC',desc='Цивилизация. Инженерия. Вся Солнечная система.'),
}

TEXT={
'lite':[
  (0,3.6,('ОН СКАЗАЛ:','ВЕНЕРУ МОЖНО','ВОСКРЕСИТЬ'), 'ОДИН ЧЕЛОВЕК ПРОТИВ НЕВОЗМОЖНОГО'),
  (3.6,7.2,('СССР.','ЗАКРЫТЫЙ','ПРОЕКТ.'), 'ДОСЬЕ, КОТОРОГО НЕ СУЩЕСТВОВАЛО'),
  (7.2,10.8,('ПЕРВЫЙ ЗОНД','УХОДИТ В','ОБЛАКА'), 'НАУКА НЕ ПРОЩАЕТ САМОНАДЕЯННОСТИ'),
  (10.8,14.4,('РИСКНУТЬ','ИЛИ СПАСТИ','ЭКСПЕДИЦИЮ?'), 'ТВОИ РЕШЕНИЯ ИМЕЮТ ПОСЛЕДСТВИЯ'),
  (14.4,18,('HELIOS','ДОСЬЕ ВЕНЕРЫ','ИГРАТЬ В БРАУЗЕРЕ'), 'anatolichka2202.github.io/HELIOS/')
],
'mobile':[
  (0,3.6,('ОДИН ШТОРМ.','ТРИ СТАНЦИИ.','ТВОЯ СМЕНА.'), 'У КАЖДОГО РЕШЕНИЯ ЕСТЬ ЦЕНА'),
  (3.6,7.2,('СОЕДИНИ','ОБЛАЧНЫЕ','ПОСЕЛЕНИЯ'), 'СЕТЬ АЭРОСТАТОВ НА ВЕНЕРЕ'),
  (7.2,10.8,('ДОСТАВЬ','ТОПЛИВО И','ЛЮДЕЙ'), 'СОБЕРИ ЦЕПОЧКУ СНАБЖЕНИЯ'),
  (10.8,14.4,('КОМАНДА','ЖДЁТ ТВОЕГО','РЕШЕНИЯ'), 'РЕМОНТ, РИСК, ЖИЗНЬ ЭКСПЕДИЦИИ'),
  (14.4,18,('HELIOS','ОБЛАЧНАЯ СЛУЖБА','В РАЗРАБОТКЕ'), 'САМОСТОЯТЕЛЬНАЯ МОБИЛЬНАЯ ИГРА')
],
'pc':[
  (0,4,('ОДНА ИДЕЯ','ИЗМЕНИТ','СОЛНЕЧНУЮ СИСТЕМУ'), 'СЕКРЕТНАЯ ПРОГРАММА СТАНЕТ ИСТОРИЕЙ'),
  (4,8,('ВЕНЕРА.','МЕРКУРИЙ.','ДАЛЬШЕ.'), 'ВЫХОД ЗА ПРЕДЕЛЫ ОДНОЙ ПЛАНЕТЫ'),
  (8,12,('ПРОЕКТИРУЙ.','СТРОЙ.','СОХРАНЯЙ.'), 'ЭНЕРГИЯ, ПРОМЫШЛЕННОСТЬ, ЛОГИСТИКА'),
  (12,16,('ВОЙДИ В МИР,','КОТОРЫЙ ТЫ','ПОСТРОИЛ'), 'СТРАТЕГИЯ И ЛИЧНОЕ ПРИСУТСТВИЕ'),
  (16,20,('HELIOS','БОЛЬШАЯ СТРАТЕГИЯ','PC · В РАЗРАБОТКЕ'), 'КОНЦЕПТУАЛЬНЫЙ ТИЗЕР')
]}

def pil_color(hexstr):return tuple(int(hexstr[i:i+2],16) for i in (1,3,5))

def rr(draw,box,radius,fill,outline=None,width=1):
    draw.rounded_rectangle(tuple(map(int,box)),radius=radius,fill=fill,outline=outline,width=width)

def alpha_layer(base,overlay,alpha=1):
    if alpha<=0:return
    if alpha<1:
        al=overlay.getchannel('A').point(lambda p:int(p*alpha))
        overlay.putalpha(al)
    base.alpha_composite(overlay)

def starfield(draw,w,h,t,seed=11):
    rng=random.Random(seed)
    for j in range(94 if w>=1000 else 78):
        x=rng.randrange(0,w);y=rng.randrange(0,h)
        x=(x+.75*t*(1+j%3))%w
        y=(y+(.6 if j%2 else -.2)*t)%h
        light=95+int(70*math.sin(t*1.8+j)**2)
        size=1 if j%9 else 2
        draw.ellipse((x-size,y-size,x+size,y+size),fill=(192,207,216,light))

def paste_planet(frame,w,h,t,shot,which):
    vert=h>w
    if vert:
        diameter=int(w*(1.12 if shot<2 else .9))
        x=int(w*.20 if shot==0 else w*.23)+int(12*math.sin(t*.35))
        y=int(h*.33 if shot==0 else h*.18)+int(22*math.sin(t*.25))
    else:
        diameter=int(h*(1.18 if shot<2 else .84))
        x=int(w*.48 if shot==0 else w*.64)+int(14*math.sin(t*.35))
        y=int(h*.16 if shot==0 else h*.18)+int(9*math.sin(t*.25))
    image=PLANET.resize((diameter,diameter),Image.Resampling.BILINEAR)
    # visible glow under the planet, chromatically smooth and isolated
    glow=Image.new('RGBA',(diameter+130,diameter+130));d=ImageDraw.Draw(glow)
    d.ellipse((45,45,diameter+85,diameter+85),fill=(201,103,47,70))
    glow=glow.filter(ImageFilter.GaussianBlur(65))
    frame.alpha_composite(glow,(x-65,y-65))
    frame.alpha_composite(image,(x,y))

def text_fit(draw,text,maxwidth,startsize,minsize=20,bold=True):
    size=startsize
    while size>minsize and draw.textbbox((0,0),text,font=font(size,bold))[2]>maxwidth:size-=2
    return font(size,bold)

def text_at(draw,text,xy,px,fill=(255,240,215,255),center=False,width=None,bold=True,spacing=0):
    face=text_fit(draw,text,width,px,bold=bold) if width else font(px,bold)
    x,y=xy
    if center:
        box=draw.textbbox((0,0),text,font=face);x=x-(box[2]-box[0])/2
    draw.text((x,y),text,font=face,fill=fill,stroke_width=0)


def oval_path(draw,center,radii,colors,stroke=2,portion=1,start=-90):
    # dash-like orbital trajectory into Venus/clouds
    cx,cy=center;rx,ry=radii
    pts=[]
    for k in range(int(145*portion)+1):
        a=math.radians(start+360*k/145)
        pts.append((cx+rx*math.cos(a),cy+ry*math.sin(a)))
    if len(pts)>1:draw.line(pts,fill=colors,width=stroke,joint='curve')

def draw_probe(d,w,h,t,accent):
    angle=t*1.7
    cx,cy=int(w*.65),int(h*(.36 if h>w else .36))
    px=cx+int(145*math.sin(angle));py=cy-int(125*math.cos(angle))
    d.line([(px-33,py-11),(px+33,py+11)],fill=(*accent,210),width=4)
    d.rectangle((px-17,py-13,px+17,py+13),fill=(201,218,216,255),outline=(255,232,192,255),width=2)
    d.rectangle((px-57,py-10,px-23,py+9),fill=(38,106,133,255),outline=(113,208,218,255),width=2)
    d.rectangle((px+23,py-9,px+58,py+10),fill=(38,106,133,255),outline=(113,208,218,255),width=2)
    d.ellipse((px-3,py-3,px+3,py+3),fill=(255,183,104,255))
    oval_path(d,(cx,cy),(160,160),(*accent,95),2,portion=.5,start=-140)

def draw_station(d,w,h,t,accent,x,y,scale=1,bad=False):
    wav=math.sin(t*2+x*.01)*8*scale
    y+=wav
    body=(225,151,95,255) if not bad else (232,84,83,255)
    w0=115*scale;h0=55*scale
    d.ellipse((x-w0,y-h0,x+w0,y+h0),fill=body,outline=(255,218,172,255),width=max(2,int(3*scale)))
    d.arc((x-w0,y-h0,x+w0,y+h0),0,180,fill=(111,61,67,205),width=max(1,int(3*scale)))
    for shift in (-.55,0,.55):
        d.line((x+shift*w0,y-h0*.8,x+shift*w0*.6,y+h0*.9),fill=(81,46,59,165),width=2)
    d.line((x-50*scale,y+48*scale,x-32*scale,y+90*scale),fill=(236,215,184,255),width=2)
    d.line((x+50*scale,y+48*scale,x+32*scale,y+90*scale),fill=(236,215,184,255),width=2)
    rr(d,(x-45*scale,y+85*scale,x+45*scale,y+108*scale),5,(73,144,157,255),(224,240,227,255),2)
    for n in range(4):
        d.rectangle((x-30*scale+n*17*scale,y+90*scale,x-23*scale+n*17*scale,y+100*scale),fill=(239,219,157,255))
    if bad:
        for i in range(3):
            s=10+11*i
            d.line((x-s,y+22*scale,x-s-9*scale,y+39*scale),fill=(255,70,73,230),width=3)

def draw_archive(frame,d,w,h,t,accent):
    # Classified paperwork — original art, not a real Soviet document.
    y0=int(h*.21 if h>w else h*.13); x0=int(w*.15 if h>w else w*.33)
    size=int(w*.8 if h>w else w*.45)
    shear=9*math.sin(t*.7)
    bb=(x0+shear,y0+shear,x0+size+shear,y0+int(size*.75)+shear)
    rr(d,bb,8,(210,198,172,238),outline=(252,227,182,255),width=2)
    ox,oy=int(bb[0]),int(bb[1]);fw=int(size)
    d.line((ox+25,oy+57,ox+fw-25,oy+57),fill=(89,82,75,255),width=2)
    text_at(d,'АРХИВ  ·  1978',(ox+24,oy+17),int(w*.028) if h>w else 23,(76,62,59,255),width=fw-42)
    for k in range(5):
        yy=oy+97+k*28
        d.line((ox+26,yy,ox+fw-40-k*19,yy),fill=(112,108,106,105),width=2)
    text_at(d,'СЕКРЕТНО',(ox+43,oy+int(size*.5)),int(w*.075) if h>w else 42,(164,52,50,225),width=fw-80)
    # diagonal border lines of a graph extending from archive
    oval_path(d,(ox+int(fw*.55),oy+int(size*.3)),(fw*.23,fw*.16),(85,85,79,150),2,.83,start=-40)


def draw_network(d,w,h,t,accent):
    pts=[(w*.29,h*.31),(w*.69,h*.43),(w*.41,h*.54)]
    for i,(x,y) in enumerate(pts):
        for j in range(i):
            a,b=pts[j]
            d.line((a,b,x,y),fill=(*accent,70),width=2)
            for k in range(5):
                p=(k/5+t*.12+i*.2)%1
                px=mix(a,x,p);py=mix(b,y,p)
                d.ellipse((px-3,py-3,px+3,py+3),fill=(*accent,210))
        draw_station(d,w,h,t+i*.6,accent,x,y,.69 if h>w else .54,bad=(i==1 and t%8>5))


def draw_solar_system(d,w,h,t,accent):
    # stylized technological expansion, not scientifically scaled distances
    cx,cy=(w*.58,h*.49)
    for idx,r in enumerate([85,135,196,264,337]):
        oval_path(d,(cx,cy),(r,r*.54),(175,181,196,110),2,1,start=-90)
        angle=.4*t/(idx+1)+idx*1.31
        px=cx+r*math.cos(angle);py=cy+r*.54*math.sin(angle)
        sz=[13,22,17,10,9][idx]
        col=[(243,201,119),(234,156,104),(145,184,192),(184,124,102),(197,173,146)][idx]
        d.ellipse((px-sz,py-sz,px+sz,py+sz),fill=(*col,255),outline=(249,225,188,200),width=1)
        if idx<=2:
            d.line((cx,cy,px,py),fill=(*accent,60),width=1)
    d.ellipse((cx-24,cy-24,cx+24,cy+24),fill=(252,211,123,255))
    rr(d,(w*.1,h*.81,w*.9,h*.83),4,(20,40,57,170),(*accent,100),2)


def vignette(frame):
    w,h=frame.size
    if h>w:return
    d=ImageDraw.Draw(frame,'RGBA')
    # headline title contrast on left; dark elegant glass strip
    d.rectangle((0,0,int(w*.46),h),fill=(1,11,24,85))

def make_frame(spec,t,seed=25):
    w,h=spec['w'],spec['h'];which=spec['slug'].lower();accent=spec['accent'];total=spec['duration']
    stage=next((i for i,(a,b,_,__) in enumerate(TEXT[which]) if a<=t<b),4)
    tlocal=t-TEXT[which][stage][0]
    base=BG[(w,h)].copy();d=ImageDraw.Draw(base,'RGBA')
    starfield(d,w,h,t,seed)
    if which in ('lite','pc'):
        if which=='pc' and stage==1:draw_solar_system(d,w,h,t,accent)
        elif stage in (0,2,3):paste_planet(base,w,h,t,stage,which)
    if which=='lite' and stage==1:draw_archive(base,d,w,h,tlocal,accent)
    if which=='lite' and stage==2:draw_probe(d,w,h,t,accent)
    if which=='lite' and stage==3:
        draw_station(d,w,h,t,accent,w*.58,h*.47,.95,bad=(tlocal>1.2))
    if which=='mobile' and stage in (0,1,2,3):
        cloud=CLOUD[(w,h)].copy()
        shifted=int(t*10)%max(1,w)
        cloud=cloud.transform((w,h),Image.Transform.AFFINE,(1,0,shifted,0,1,0),Image.Resampling.BILINEAR)
        base.alpha_composite(cloud)
        d=ImageDraw.Draw(base,'RGBA')
        draw_network(d,w,h,t,accent)
    if which=='pc' and stage==2:
        for i in range(4):
            x=w*.58+100*math.sin(i*1.13);y=h*.48+50*math.cos(i*1.7)
            rr(d,(x-35,y-16,x+35,y+16),7,(30,79,94,245),(*accent,155),2)
            for j in range(i):
                x2=w*.58+100*math.sin(j*1.13);y2=h*.48+50*math.cos(j*1.7)
                d.line((x,y,x2,y2),fill=(*accent,150),width=2)
    if which=='pc' and stage==3:
        paste_planet(base,w,h,t,2,which)
        d=ImageDraw.Draw(base,'RGBA')
        draw_station(d,w,h,t,accent,w*.66,h*.48,1.2)
    if stage==4 and which!='mobile':paste_planet(base,w,h,t,1,which)
    # Titles. Left-side/or center alignment depending on social cut.
    d=ImageDraw.Draw(base,'RGBA')
    if h>w:
        base.alpha_composite(MATTES[(w,h)])
        d=ImageDraw.Draw(base,'RGBA')
    if w>h:vignette(base);d=ImageDraw.Draw(base,'RGBA')
    a,b,lines,tag=TEXT[which][stage]
    sectionDuration=b-a
    vis=smooth(tlocal/.65)*smooth((sectionDuration-tlocal)/.62)
    x=int(w*.087 if h>w else w*.066)
    bodyY=int(h*.64 if h>w else h*.37)
    if stage==4:bodyY=int(h*.55 if h>w else h*.36)
    titleSize=int(w*(.089 if h>w else .047))
    if stage==4:titleSize=int(w*(.105 if h>w else .065))
    maxWidth=w*(.84 if h>w else .49)
    # small top left telemetry and elegant accent line
    d.line((x,h*.105,x+int(w*.18),h*.105),fill=(*accent,int(vis*210)),width=3)
    text_at(d,'H E L I O S   /   '+('0'+str(stage+1)),(x,int(h*.082)),int(w*.022 if h>w else 20),(*accent,int(vis*220)),width=w*.77)
    for n,line in enumerate(lines):
        slide=int((1-smooth((tlocal-.11*n)/.66))*32)
        alpha=int(255*vis*smooth((tlocal-.12*n)/.45))
        tint=accent if (n==1 or stage==4 and n==0) else (244,242,231)
        text_at(d,line,(x+slide,bodyY+n*int(titleSize*1.34)),titleSize,(*tint,alpha),width=maxWidth)
    noteSize=int(w*(.024 if h>w else .019));ny=bodyY+len(lines)*int(titleSize*1.34)+16
    text_at(d,tag,(x,ny),noteSize,(210,223,222,int(215*vis)),width=maxWidth)
    # footer rights/claims: ALL conceptual for Mobile/PC; web Lite is playable but not matching cinematic footage
    d.line((x,h*.911,w-x,h*.911),fill=(*accent,80),width=1)
    small='КОНЦЕПТ-ТИЗЕР · НЕ ЗАПИСЬ ГЕЙМПЛЕЯ' if which!='lite' else 'ПОСТАНОВОЧНЫЙ ТИЗЕР · ИГРА УЖЕ В БРАУЗЕРЕ'
    text_at(d,small,(x,int(h*.921)),int(w*.019 if h>w else 14),(191,201,211,209),width=w-2*x)
    d.line((x,h*.965,x+(w-2*x)*(t/total),h*.965),fill=(*accent,180),width=3)
    # Cross fade at shot boundaries (soft fade from above and below with blur-like plate; prevents abrupt text pop)
    if tlocal<.24 and stage>0:
        alpha=int((1-smooth(tlocal/.24))*160)
        d.rectangle((0,0,w,h),fill=(2,9,18,alpha))
    return base.convert('RGB')

def title_matte(w,h):
    """Subtle feathered shadow behind Cyrillic hero titles on bright planets."""
    a=np.zeros((h,1),dtype=np.uint8)
    for yy in range(h):
        frac=yy/h
        if frac<.57:alpha=0
        elif frac<.65:alpha=135*smooth((frac-.57)/.08)
        elif frac<.86:alpha=135
        elif frac<.92:alpha=135*(1-smooth((frac-.86)/.06))
        else:alpha=0
        a[yy,0]=int(alpha)
    out=np.zeros((h,w,4),dtype=np.uint8)
    out[:,:,:3]=[3,12,23]
    out[:,:,3]=np.broadcast_to(a,(h,w))
    return Image.fromarray(out,'RGBA')

BG={};CLOUD={};MATTES={}

for spec in SPECS.values():
    pair=(spec['w'],spec['h'])
    if pair not in BG:BG[pair]=paper_texture(*pair)
    if pair not in CLOUD:CLOUD[pair]=make_cloud_layer(*pair)
    if pair not in MATTES and spec["vertical"]:MATTES[pair]=title_matte(*pair)

def soundtrack(spec,path):
    sec=spec['duration'];sample_rate=24000
    t=np.arange(int(sec*sample_rate))/sample_rate
    # Entirely synthesized minor-key ambient bed, no prerecorded recordings.
    base={'lite':110.0,'mobile':123.47,'pc':98.0}[spec['slug'].lower()]
    notes=np.array([base,base*1.2,base*1.5,base*2.0],dtype=np.float64)
    score=np.zeros_like(t)
    for i,n in enumerate(notes):
        env=np.sin(np.pi*np.clip(t/sec,0,1))**.6
        score+=(.026/(i+1))*(np.sin(t*2*np.pi*n+i*.4)+.3*np.sin(t*2*np.pi*n*2)) * env
    for hit in np.arange(.0,sec,3.6):
        dt=t-hit;valid=dt>0
        env=np.where(valid,np.exp(-np.maximum(dt,0)*9),0)
        score+=.12*env*np.sin(2*np.pi*(54*np.maximum(dt,0)+8*np.maximum(dt,0)**2))
        score+=.013*np.exp(-np.maximum(dt,0)*7)*np.random.default_rng(int(hit*10+99)).normal(0,1,len(t)) *valid
    for hit in np.arange(1.8,sec-1,3.6):
        dt=t-hit;valid=dt>0
        score+=.016*np.where(valid,np.exp(-np.maximum(dt,0)*2.2),0)*np.sin(2*np.pi*(380*dt+190*dt*dt))
    end=np.minimum(1,(sec-t)/1.15);start=np.minimum(1,t/.4)
    score=np.clip(score*np.maximum(0,end)*np.maximum(0,start),-.7,.7)
    left=(score*32767).astype('<i2');right=(score*.94*32767).astype('<i2')
    channels=np.column_stack((left,right))
    with wave.open(str(path),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sample_rate);f.writeframes(channels.tobytes())

def render(spec,preview=False):
    output=OUT/spec['filename'];audio=OUT/(spec['slug'].lower()+'_music.wav')
    soundtrack(spec,audio)
    w,h=spec['w'],spec['h'];total=spec['duration']
    frames=int(total*FPS);ifile=OUT/(spec['slug'].lower()+'_preview.png')
    ff=["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{w}x{h}","-r",str(FPS),"-i","-",
        "-i",str(audio),"-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","96k","-shortest","-movflags","+faststart",str(output)]
    proc=subprocess.Popen(ff,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
    try:
        for i in range(frames):
            at=i/FPS
            frame=make_frame(spec,at)
            if i==int(frames*.53):frame.save(ifile)
            proc.stdin.write(frame.tobytes())
            if i%max(FPS*4,1)==0:print(spec['slug'],f"{at:.1f}/{total:.1f}s",flush=True)
    except BrokenPipeError:
        raise RuntimeError(proc.stderr.read().decode('utf-8','ignore'))
    finally:
        try:proc.stdin.close()
        except:pass
    err=proc.stderr.read().decode('utf-8','ignore');rc=proc.wait()
    if rc:raise RuntimeError(err)
    print('OUTPUT',output,output.stat().st_size,'bytes')

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--clip',choices=('all',*SPECS),default='all');parser.add_argument('--preview',action='store_true')
    args=parser.parse_args()
    for key in (SPECS if args.clip=='all' else [args.clip]):render(SPECS[key],args.preview)
precision mediump float;

uniform float viewportWidth;
uniform float viewportHeight;
uniform float iTime;
#define pNumber 256
uniform vec3 particles[pNumber];
uniform vec2 emitterPosition;
uniform vec2 windForce;
uniform sampler2D u_texture;

//This part from the book of shaders
float random(in vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

float noise(in vec2 st){
    vec2 i=floor(st);
    vec2 f=fract(st);
    
    float a=random(i);
    float b=random(i+vec2(1.,0.));
    float c=random(i+vec2(0.,1.));
    float d=random(i+vec2(1.,1.));
    
    vec2 u=f*f*(3.-2.*f);
    
    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
}

#define OCTAVES 8
float fbm(in vec2 st){
    float value=0.;
    float amplitude=.5;
    float frequency=0.;
    
    for(int i=0;i<OCTAVES;i++){
        value+=amplitude*noise(st);
        st*=2.;
        amplitude*=.5;
    }
    return value;
}

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
    sin(_angle),cos(_angle));
}
//End of part from the book of shaders

void main(){
    vec2 resolution=vec2(viewportWidth,viewportHeight);
    float ratio=resolution.x/resolution.y;
    vec2 uv=vec2(gl_FragCoord.x/resolution.x,1.-gl_FragCoord.y/viewportHeight);
    vec2 emPos=vec2(emitterPosition.x/viewportWidth,emitterPosition.y/viewportHeight);
    uv.x*=ratio;
    uv.x+=.5-ratio/2.;
    emPos.x*=ratio;
    emPos.x+=.5-ratio/2.;
    float emitDist=1.-clamp(distance(uv,emPos),0.,1.);
    float t=.75+.5*abs(cos(iTime));
    float t2=clamp(abs(sin(iTime))*emitDist,0.,1.);
    float t3=clamp(.75+.25*abs(cos(iTime*12.))*emitDist,0.,1.);
    vec2 tCoords=vec2(uv.x/1.4+.1125,uv.y/1.4+.12);
    vec4 c=texture2D(u_texture,tCoords)*t3/1.4;
    c.a=1.;
    vec4 c2=mix(vec4(.949,.6941,.498,1.),vec4(.949,.8,.6,1.),t2/2.);
    vec4 c3=vec4(.9569,.8157,.6667,1.);
    vec2 fuv=vec2(uv.x+(iTime/24.),uv.y+(iTime/4.));
    float f=fbm(fuv*32.)*t;
    for(int i=0;i<pNumber;i++){
        vec3 tc=particles[i];
        if(tc!=vec3(-1,-1,-1)){
            vec2 cc=vec2(tc.x/viewportWidth,tc.y/viewportHeight);
            float d=abs(distance(uv,cc));
            float a=tc.z/512.;
            if(d<.045){
                float f2=fbm(cc*16.);
                float m=clamp(f*a*.005/(d/10.),f/10.,1.);
                c=mix(c,c2,m);
                c*=mix(c,c3,f2*emitDist);
                c+=f*f2/40.;
                if(emitDist>.8){
                    vec2 nTexCoords=rotate2d(.00075*sin(iTime*20.))*(tCoords-(windForce/800.));
                    vec4 texColor=texture2D(u_texture,nTexCoords);
                    if(length(texColor)>1.3){
                        c=mix(c,texColor,.15);
                    }
                };
            }
        }
    }
    c.a=1.;
    gl_FragColor=c;
}
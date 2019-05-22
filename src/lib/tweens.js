const linearTween = function (t, b, c, d) {
    return c*t/d + b;
};
const easeInQuad = function (t, b, c, d) {
    t /= d;
    return c*t*t + b;
};
const easeOutQuad = function (t, b, c, d) {
    t /= d;
    return -c * t*(t-2) + b;
};
const easeOutQuad_ex = function (t, b, c, d) {
    t /= d;
    return Math.floor(-c * t*(t-2) + b);
};
const easeInOutQuad = function (t, b, c, d) {
    t /= d/2;
    if (t < 1) { return c/2*t*t + b; }
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
};

const outBounce = function outBounce(t, b, c, d) {
    const weight = function (w) {
        if (w < 4/11.0) {
            return (121 * w * w) / 16.0
        } else if (w < 8/11.0) {
            return  (363 / 40.0 * w * w) - (99 / 10.0 * w) + 17/5.0
        } else if (w < 9/10.0) {
            return (4356 / 361.0 * w * w) - (35442 / 1805.0 * w) + 16061/1805.0
        } else {
            return (54 / 5.0 * w * w) - (513 / 25.0 * w) + 268/25.0
        }
    };

    t /= d;
    return c * weight(t) + b;
};

const getEasingFunc = function (e) {
    if (e === 'outBounce') {
        return outBounce;
    } else if (e === "easeInOut" || e === "easeInOutQuad" || e === "Quad.easeInOut")
    {
        return easeInOutQuad;
    }
    else if (e === "easeIn" || e === "easeInQuad" || e === "Quad.easeIn")
    {
        return easeInQuad;
    }
    else if (e === "easeOut" || e === "easeOutQuad" || e === "Quad.easeOut")
    {
        return easeOutQuad;
    }
    else if (e === "easeOut_ex") {
        return easeOutQuad_ex;
    }
    else
    {
        return linearTween;
    }
};

export default class Tweens {
    constructor() {
        this.activeForTweens = false;
        this.processFrame = true;
        this.tweenTargets = [];
        this.fps = 60;
    }

    addTween(o, duration, vars, delay, easing, overwrite, onComplete) {
        let v = null;
        for (const prop in vars) {
            if (!v) { v = {}; }
            v[prop] = { b: o[prop], c: vars[prop] - o[prop] };
        }
        
        if (v) {
            const t = {
                target : 		o,
                duration : 		duration,
                easingFunc : 	getEasingFunc(easing),
                overwrite : 	overwrite || false,
                onComplete : 	onComplete || null,
                totalFrames : 	duration * this.fps,
                delayFrame:     delay * this.fps,
                currentFrame : 	0,
                vars : 			v
            };
                    
            const idx = this.findTargetIndex(o);
            if (idx >= 0) {
                const x = this.tweenTargets[idx];
                let tweens = x.tweens;
                if (!tweens) {
                    tweens = [];
                }
                if (t.overwrite) {
                    for (let i=0; i < tweens.length; i++) {
                        tweens[i] = null;
                    }
                    tweens = [];
                }
                
                tweens[tweens.length] = t;
                x.tweens = tweens;
            } else {
                this.tweenTargets[this.tweenTargets.length] = {
                    o: o,
                    tweens: [t]
                };
            }

            if (this.tweenTargets.length > 0 && !this.activeForTweens) {
                this.activeForTweens = true;
            }
        }
    }

    findTargetIndex(o) {
        for (let i=0; i<this.tweenTargets.length; i++) {
            if(this.tweenTargets[i].o === o) {
                return i;
            }
        }

        return -1;
    }

    removeTween(o, t) {
        let targetRemoved = false;
        
        if (o && t) {
            const idx = this.findTargetIndex(o);
            if (idx >= 0) {
                if (this.tweenTargets[idx].tweens && this.tweenTargets[idx].tweens.length > 0) {
                    const tweens = this.tweenTargets[idx].tweens;
                    const idx2 = tweens.indexOf(t);
                    if (idx2 >= 0) {
                        t.onComplete = null;
                        t.easingFunc = null;
                        t.target = null;
                        
                        tweens.splice(idx2, 1);
                        if (tweens.length === 0) {
                            this.tweenTargets.splice(idx, 1);
                            targetRemoved = true;
                        }
                    } else {
                        console.log(o, t);
                        throw new Error("No tween defined for this object");
                    }
                } else {
                    throw new Error("No tween defined for this object");
                }
            } else {
                throw new Error("No tween target defined for this object");
            }
            
            if (this.tweenTargets.length === 0) {
                this.activeForTweens = false;
            }
        }
        
        return targetRemoved;
    }

    update() {
        if (this.activeForTweens) {
            // and a loop for tween animations
            let len = this.tweenTargets.length;
            for (let i=0; i < len; i++)
            {
                const x = this.tweenTargets[i];
                const o = x.o;
                const tweens = x.tweens;
                for (let j=0; j < tweens.length; j++)
                {
                    const t = tweens[j];
                    t.currentFrame++;
                    if (t.currentFrame >= t.delayFrame) {
                        const vars = t.vars;
                        for (const prop in vars)
                        {
                            o[prop] = t.easingFunc(t.currentFrame - t.delayFrame, vars[prop].b, vars[prop].c, t.totalFrames);
                        }
                        
                        if (t.currentFrame - t.delayFrame >= t.totalFrames) {
                            const onComplete = t.onComplete;
                            if (this.removeTween(o, t)) {
                                i--; len--;
                            }
                            j--;

                            if (onComplete) { onComplete(); }
                        }
                    }
                }
            }
        }
    }

}
class jquery {
  constructor(element) {
    this.$element = [];
    this.animateInter = [];
    for (let index = 0; index < element.length; index++) {
      const e = element[index];
      this.$element.push(e);
    }
  }
  remove(){
    let arr = this.$element;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      element.remove();
    }
    return this;
  }
  addClass(name) {
    let arr = this.$element;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      let _class = element.className;
      let _classes =  [..._class.split(' '),...name.split(' ')];
      _classes = Array.from(new Set(_classes));
      _classes = _classes.filter(m=>!!m);
      element.className = _classes.join(" ");
    }
    return this;
  }

  attr(name,value) {
    if(typeof(value) != 'undefined'){
      let arr = this.$element;
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        element.setAttribute(name,value);
      }
      return this;
    }else{
      return this.$element[0].getAttribute(name);
    }
  }

  stop(){
    for (let index = 0; index < this.animateInter.length; index++) {
      const element = this.animateInter[index];
      clearInterval(inter);
    }
    this.animateInter = [];
    return this;
  }

  fadeIn(options){
    const {duration,easing,complete} = options;
    let arr = this.$element;
    let self = this;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      (function(e){
        e.style.display = '';
        e.style.opacity = 0;
        let begin = new Date();
        let inter = setInterval(()=>{
          let end = new Date();
          let mid = end - begin;
          let per = mid / duration;
          if(mid >= duration)per = 1;
          e.style.opacity = per;
          if(per == 1){
            self.animateInter.splice(self.animateInter.indexOf(inter),1);
            clearInterval(inter);
            if(!!complete)complete();
          }
        },10);
        self.animateInter.push(inter)
      })(element);
    }
    return this;
  }
  fadeOut(options){
    const {duration,easing,complete} = options;
    let arr = this.$element;
    let self = this;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      (function(e){
        let begin = new Date();
        let inter = setInterval(()=>{
          let end = new Date();
          let mid = end - begin;
          let per = mid / duration;
          if(mid >= duration)per = 1;
          e.style.opacity = 1 - per;
          if(per == 1){
            e.style.display = 'none';
            self.animateInter.splice(self.animateInter.indexOf(inter),1);
            clearInterval(inter);
            if(!!complete)complete();
          }
        },10);
        self.animateInter.push(inter)
      })(element);
    }
    return this;
  }

  append(html){
    let arr;
    if(html instanceof jquery){
      arr = html.$element;
    }else{
      arr = $(html).$element;
    }
    if(arr.length){
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        this.$element[0].appendChild(element);
      }
    }else{
      this.$element[0].append(html);
    }
    return this;
  }
  prepend(html){
    let arr;
    if(html instanceof jquery){
      arr = html.$element;
    }else{
      arr = $(html).$element;
    }
    if(arr.length){
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if(this.$element[0].childNodes.length)
          this.$element[0].insertBefore(element,this.$element[0].childNodes[0]);
        else 
          this.$element[0].appendChild(element);
      }
    }else{
      if(this.$element[0].childNodes.length)
        this.$element[0].prepend(html);
      else 
        this.$element[0].append(html);
    }
    return this;
  }
  hide(){
    let arr = this.$element;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      element.style.display = "none";
    }
    return this;
  }
  hover(on,off){
    let arr = this.$element;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      element.addEventListener("mouseup",on)
      element.addEventListener("mouseleave",off)
    }
    return this;
  }
  click(e){
    let arr = this.$element;
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      element.addEventListener("click",e)
    }
    return this;
  }
  width(value){
    if(typeof value == 'undefined'){
      return this.$element[0].style.width;
    }else{
      let arr = this.$element;
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        element.style.width = value;
      }
      return this;
    }
  }
  
}

function $(html) {
  let temp = document.createElement('template');
  html = html.trim();
  temp.innerHTML = html;
  return new jquery(temp.content.children);
}

export default $;
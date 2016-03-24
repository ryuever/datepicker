var datePicker = module.exports = function(options){
  this.opts = {};

  this.today = new Date((new Date()).setHours(0,0,0,0));

  this.state = {};
  this.state = {
    panel_date: new Date(this.today.getFullYear(), this.today.getMonth()),
    display_date: this.today,
    selected_date: ''
  };

  this.shouldRender = true;

  this.init(options);

  this._onInputClick = this._onInputClick.bind(this);
  this._onClick = this._onClick.bind(this);
  this._reposition = this._reposition.bind(this);

  self = this;

  Object.defineProperty(this.state, '_panel_date',{
    set: function(value){
      this.panel_date = value;
      self.shouldRender = true;
      self.renderPanel();
    }
  });

  Object.defineProperty(this.state, '_display_date',{
    set: function(value){
      this.display_date = value;
      self.shouldRender = true;
      self.renderPanel();
    }
  });

  Object.defineProperty(this.state, '_selected_date',{
    set: function(value){
      this.selected_date = value;
      self.shouldRender = true;
      self.renderPanel();
    }
  });
  this.bindEvent();
};

datePicker.prototype.init = function(options){
  this.opts = extend({}, options, true);
};

datePicker.prototype.bindEvent = function(options){
  var target = this.opts.field;
  target.addEventListener('click', this._onInputClick, true);
};

datePicker.prototype._onInputClick = function(e){
  this.renderPanel();
  this.show();
  self = this;

  e.stopPropagation();
};

datePicker.prototype.setState = function(options){
  for (var key in options){
    this.state[key] = options[key];
  }
};

datePicker.prototype.renderPanel = function(){
  if (!this.panel){
    this.panel = document.createElement('div');
    this.panel.className = 'date-picker-container';
    this.panel.style.width = "300px";
    this.panel.style.height = "200px";
    this.panel.style.border = '1px solid #eee';
    this.panel.innerHTML = "<div class='date-picker-header'></div><div class='date-picker-body'></div>";
    document.body.appendChild(this.panel);
  }else{
    this.panel.style.display = "block";
  }

  this.renderPanelHeader();
  this.renderPanelBody();
};

datePicker.prototype.renderPanelHeader = function(){
  if (this.shouldRender){
    var panel_header_html = '<div>';

    panel_header_html = panel_header_html + "<span class='date-picker-prev-year'>&#171</span>" +
      "<span class='date-picker-prev-month'>&#139</span>" +
      this.state.panel_date.getFullYear() + ' ' +
      (this.state.panel_date.getMonth() + 1) +
      "<span class='date-picker-next-month'>&#155</span>" +
      "<span class='date-picker-next-year'>&#187</span> </div>";
    var panel_header = findChildNodeByClass(this.panel, 'date-picker-header');
    panel_header.innerHTML = panel_header_html;
  }
};

datePicker.prototype.renderPanelBody = function(){
  if(this.state.selected_date){
    var selected_date_year = this.state.selected_date.getFullYear();
    var selected_date_month = this.state.selected_date.getMonth();
    var selected_date_day = this.state.selected_date.getDate();
  }

  if (this.shouldRender){
    var year = this.state.panel_date.getFullYear();
    var month = this.state.panel_date.getMonth();

    var month_list = getWeekInMonth(year, month);

    var panel_body_html = '<table><tr><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td><td>七</td></tr><tbody>';
    var day = 0;
    var item_class = '';

    for (var i=0 ; i<month_list.length; i++){
      item_class = 'date-picker-item';
      day = month_list[i] ? parseInt(month_list[i]) : undefined;

      if((i==0 && day < 0) || i%7 == 0){
        if(i>0)
          panel_body_html += "</tr>";
        panel_body_html += "<tr>";
      }

      if (new Date(year, month, day).toString() == this.state.selected_date.toString()){
        item_class += ' active';
      }

      if (new Date(year, month, day).toString() == this.today.toString()){
        item_class += ' current';
      }

      panel_body_html += "<td>"+ "<button class=' " + item_class + " ' value=" + day + ">" +
        ((day && day >0) ? day : '') + "</button>" + "</td>";
    }

    panel_body_html += "</tbody></table>";
    var panel_body = findChildNodeByClass(this.panel, 'date-picker-body');
    panel_body.innerHTML = panel_body_html;
  }
};

datePicker.prototype._reposition = function(){
  var rect = this.opts.field.getBoundingClientRect();

  var scroll_top = window.pageYOffset;
  var scroll_left = window.pageXOffset;

  var top = rect.bottom + scroll_top;
  var left = rect.left + scroll_left;

  this.panel.style.position = 'absolute';
  this.panel.style.left = left + "px";
  this.panel.style.top = top + "px";
};

datePicker.prototype._onClick = function(e){
  e = e || window.event;
  var target = e.target;

  switch(true){
  case (hasClass(target, 'date-picker-prev-month')):
    this.setState({_panel_date: getPrevMonthDate(this.state.panel_date)});
    break;

  case (hasClass(target, 'date-picker-next-month')):
    this.setState({_panel_date: getNextMonthDate(this.state.panel_date)});
    break;

  case(hasClass(target, 'date-picker-prev-year')):
    this.setState({_panel_date: getPrevYearDate(this.state.panel_date)});
    break;

  case(hasClass(target, 'date-picker-next-year')):
    this.setState({_panel_date: getNextYearDate(this.state.panel_date)});
    break;

  case(hasClass(target, 'date-picker-item')):
    var next_year = this.state.panel_date.getFullYear();
    var next_month = this.state.panel_date.getMonth();
    this.setState({_selected_date : new Date(next_year, next_month, target.value)});
    this.updateInputValue();
    break;

  case(!hasParentNodeWithClass(target, 'date-picker-container')):
    this.hide();
    break;

  default:
    return;
  }
};

datePicker.prototype.updateInputValue = function(){
  this.opts.field.value = this.state.selected_date.toDateString();
  var event = new Event('change');
  this.opts.field.dispatchEvent(event);
  this.hide();
};

datePicker.prototype.show = function(){
  if(this.shouldRender){
    this.renderPanelHeader();
    this.renderPanelBody();
  }
  window.addEventListener('click', this._onClick, true);
  this._reposition();
};

datePicker.prototype.hide = function(){
  window.removeEventListener('click', this._onClick, true);
  this.panel.style.display = 'none';
};

var isWeekend = function(date){
  var day = date.getDay();
  return day === 0 || day === 6;
};

var isLeapYear = function(year){
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
};

var getDaysInMonth = function(year, month){
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

var getWeekInMonth = function(year, month){
  var month_days = getDaysInMonth(year, month);
  var month_begin = new Date(year, month, 1);

  var week_month_begin = month_begin.getDay() ;

  console.log('week month begin : ', week_month_begin);
  var padding_arr = [];
  while((--week_month_begin > 0))
    padding_arr.push(-1);

  var month_list =[];
  while (month_days--)
    month_list[month_days] = month_days + 1;

  var ret = padding_arr.concat(month_list);
  console.log('ret : ', ret);
  return ret;
};

var getPrevMonthDate = function(date){
  var tmp = date;
  return new Date(tmp.setMonth(tmp.getMonth() - 1));
};

var getNextMonthDate = function(date){
  var tmp = date;
  return new Date(tmp.setMonth(tmp.getMonth() + 1));
};

var getPrevYearDate = function(date){
  var tmp = date;
  return new Date(tmp.setFullYear(tmp.getFullYear() - 1));
};

var getNextYearDate = function(date){
  var tmp = date;
  return new Date(tmp.setFullYear(tmp.getFullYear() + 1));
};

var findChildNodeByClass = function(pEl, className){
  var elementChildren = pEl.children;
  for (var i = 0; i < elementChildren.length; i++) {
    if (elementChildren[i].className === className)
      return elementChildren[i];
  }
};

var hasClass = function(el, cn)
{
  return (' ' + el.className + ' ').indexOf(' ' + cn + ' ') !== -1;
};

var hasParentNodeWithClass = function(El, pElClassName){
  do {
    if (hasClass(El, pElClassName)){
      return true;
    }
  }
  while ((El = El.parentNode));
  return false;
};

var extend = function(to, from, overwrite)
{
  var prop, hasProp;
  for (prop in from) {
    hasProp = to[prop] !== undefined;
    if (hasProp && typeof from[prop] === 'object' && from[prop] !== null && from[prop].nodeName === undefined) {
      if (isDate(from[prop])) {
        if (overwrite) {
          to[prop] = new Date(from[prop].getTime());
        }
      }
      else if (isArray(from[prop])) {
        if (overwrite) {
          to[prop] = from[prop].slice(0);
        }
      } else {
        to[prop] = extend({}, from[prop], overwrite);
      }
    } else if (overwrite || !hasProp) {
      to[prop] = from[prop];
    }
  }
  return to;
};

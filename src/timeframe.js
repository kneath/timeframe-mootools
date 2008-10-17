/*
  Script: timeframe.js
    Click-draggable. Range-makeable. A better calendar. In MoooTools

  License:
    MIT-style license.
*/

var Timeframes = [];

var Timeframe = new Class({
  Implements: [Options, Events],
  
  options: {
    months: 2,
    format: (typeof Date.CultureInfo == 'undefined' ? '%b %d, %Y' : Date.CultureInfo.formatPatterns.shortDate),
    monthNames: (typeof Date.CultureInfo == 'undefined' ? 'January February March April May June July August September October November December'.split(' ') : Date.CultureInfo.monthNames),
    dayNames: (typeof Date.CultureInfo == 'undefined' ? 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ') : Date.CultureInfo.dayNames),
    weekOffset: (typeof Date.CultureInfo == 'undefined' ? 0 : Date.CultureInfo.firstDayOfWeek),
    startField: null,
    endField: null,
    previousButton: null,
    todayButton: null,
    nextButton: null,
    resetButton: null,
    earliest: null,
    latest: null,
    maxRange: false,
  },
  
  // Keeps an array of the calendar tables available
  calendars: [],
  // Hash containing the start and end fields
  fields: new Hash(),
  
  initialize: function(element, options){
    // Setup & Abandon if no element
    this.element = $(element);
    if (this.element == null) return;
    
    // Initial Setup
    this.setOptions(options);
    Timeframes.push(this);
    
    this.fields = new Hash({ start: $(this.options.startField), end: $(this.options.endField) });
    
    this._buildButtons();
    this._buildFields();
  },
  
  
  
  _buildButtons: function(){
    var buttons = new Hash({
      previous: { label: '&larr;', element: $(this.options.previousButton) },
      today:    { label: 'T',      element: $(this.options.todayButton) },
      reset:    { label: 'R',      element: $(this.options.resetButton) },
      next:     { label: '&rarr;', element: $(this.options.nextButton) }
    })
    
    var buttonList = new Element('ul', {id: this.element.id + '_menu', className: 'timeframe_menu'});
    buttons.each(function(value, key){
      if (value.element != null){
        value.element.addClass('timeframe_button').addClass(key)
      }else{
        var item = new Element('li');
        var button = new Element('a', {'class': 'timeframe_button ' + key, href: '#', text: value.label});
        item.adopt(button);
        buttonList.adopt(item);
      }
    });
    
    this.element.grab(buttonList, 'top')
  },
  
  _buildFields: function() {
    var fieldsContainer = new Element('div', {id: this.element.id + '_fields', 'class': 'timeframe_fields'});
    this.fields.each(function(element, key){
      if (element != null){
        element.addClass('timeframe_field').addClass(key);
      }else{
        var container = new Element('div');
        var label = new Element('label', { 'for': key + "_field", text: key});
        var input = new Element('input', { id: key + "_field", name: key + "_field", type: 'text', 'class': 'timeframe_field ' + key});
        container.adopt(label, input);
        fieldsContainer.adopt(container);
        this.fields.set(key, input);
      }
    }, this);
    this.element.adopt(fieldsContainer);
    
    // this.parseField('start').refreshField('start').parseField('end').refreshField('end').initDate = new Date(this.date);
  }
});
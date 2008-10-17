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
  
  initialize: function(element, options){
    // Setup & Abandon if no element
    this.element = $(element);
    if (this.element == null) return;
    
    // Initial Setup
    this.setOptions(options);
    Timeframes.push(this);
    
    this._buildButtons();
  },
  
  
  
  _buildButtons: function(){
    var buttons = new Hash({
      previous: { label: '&larr;', element: this.options.previousButton },
      today:    { label: 'T',      element: this.options.todayButton },
      reset:    { label: 'R',      element: this.options.resetButton },
      next:     { label: '&rarr;', element: this.options.nextButton }
    })
    
    var buttonList = new Element('ul', {id: this.element.id + '_menu', className: 'timeframe_menu'});
    buttons.each(function(value, key){
      if (value.element != null){
        $(value.element).addClass('timeframe_button').addClass(key)
      }else{
        var item = new Element('li');
        var button = new Element('a', {'class': 'timeframe_button ' + key, href: '#', text: value.label});
        item.appendChild(button);
        buttonList.appendChild(item);
      }
    });
    
    buttonList.inject(this.element, 'top');
  }
});
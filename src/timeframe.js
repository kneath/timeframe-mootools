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
  // Keeps a running count of how many months are in this.calendars
  months: 0,
  
  initialize: function(element, options){
    // Setup & Abandon if no element
    this.element = $(element);
    if (this.element == null) return;
    
    // Initial Setup
    this.setOptions(options);
    Timeframes.push(this);
    
    this._buildButtons();
    
    this.fields = new Hash({ start: $(this.options.startField), end: $(this.options.endField) });
    this._buildFields();
    
    this.element.adopt(new Element('div', {id: this.element.id + "_container"}))
    
    this.options.months.times(this.createCalendar.bind(this));
  },
  
  createCalendar: function(){
    // Create a base table
    var calendar = new Element('table', {
      id: this.element.id + '_calendar_' + this.calendars.length, border: 0, cellspacing: 0, cellpadding: 0
    });
    
    // Insert a <caption>
    var caption = new Element('caption');
    calendar.adopt(caption);
    calendar.set('caption', caption);
    
    // Insert the headings
    var thead = new Element('thead')
    var row = new Element('tr');
    this.options.dayNames.length.times(function(index){
      var dayName = this.options.dayNames[(index + this.options.weekOffset) % 7]
      var cell = new Element('th', {scope: 'col', abbr: dayName, text: dayName.substr(0,1)})
      row.adopt(cell);
    }, this);
    thead.adopt(row);
    calendar.adopt(thead);
    
    // Insert empty rows into the table (for population later)
    var tbody = new Element('tbody');
    (6).times(function(rowNumber){
      var row = new Element('tr');
      this.options.dayNames.length.times(function(){
        row.adopt(new Element('td'));
      })
      tbody.adopt(row);
    }, this);
    calendar.adopt(tbody);
    
    // Insert the calendar
    this.element.getElement('div#' + this.element.id + '_container').adopt(calendar);
    this.calendars.push(calendar);
    this.months = this.calendars.length;
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
    
    // TODO: this.parseField('start').refreshField('start').parseField('end').refreshField('end').initDate = new Date(this.date);
  }
});
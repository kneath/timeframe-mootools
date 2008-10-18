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
  fields: {},
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
    
    this.date = new Date();
    this.populate();
  },
  
  /*
    Function: createCalendar
    Creates a new blank calendar table (for a month)
  */
  createCalendar: function(){
    // Create a base table
    var calendar = new Element('table', {
      id: this.element.id + '_calendar_' + this.calendars.length, border: 0, cellspacing: 0, cellpadding: 0
    });
    
    // Insert a <caption>
    var caption = new Element('caption');
    calendar.adopt(caption);
    
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
  
  /* 
    Function: destroyCalendar
    Removes the last calendar from the array
  */
  destroyCalendar: function(){
    this.calendars.pop();
    this.months = this.calendars.length;
  },
  
  /*
    Function: populate
    Populates the active calendars with date numberss
  */
  populate: function(){
    var month = this.date.neutral();
    month.setDate(1);
    this.calendars.each(function(calendar){
      calendar.getElement('caption').set('text', this.options.monthNames[month.getMonth()] + ' ' + month.getFullYear());
      
      // Setup the iterator and setup inactive to know it's before the month
      var iterator = new Date(month);
      var offset = (iterator.getDay()  - this.options.weekOffset) % 7;
      var inactive = offset > 0 ? 'pre beyond' : false;
      iterator.setDate(iterator.getDate() - offset);
      if (iterator.getDate() > 1 && !inactive){
        iterator.setDate(iterator.getDate() - 7);
        if (iterator.getDate() > 1) inactive = 'pre beyond';
      }
      
      calendar.getElements('td').each(function(dayCell){
        var date = new Date(iterator);
        dayCell.set({
          'date': date,
          'text': date.getDate(),
          'class': inactive || 'active'
        });
        if ((this.options.earliest && date < this.earliest) || (this.latest && date > this.latest)){
          dayCell.addClass('unselectable');
        }else{
          dayCell.addClass('selectable');
        }
        if (iterator.toString() === new Date().neutral().toString()) dayCell.addClass('today');
        dayCell.set('baseClass', dayCell.get('class'));
        
        // Iterate one day and add class if it's beyond the month
        iterator.setDate(iterator.getDate() + 1);
        if (iterator.getDate() == 1) inactive = inactive ? false : 'post beyond';
      }, this);
      
      // Iterate to the next month
      month.setMonth(month.getMonth() + 1);
    }, this);
  },
  
  // Internal function to create buttons used for calendar navigation
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
  
  // Internal function to build the fields used for start/end dates
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

$extend(Date.prototype, {
  neutral: function() {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 12);
  }
});
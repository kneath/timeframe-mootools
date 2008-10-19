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
  // Keeps a hash of the previous/next/today/reset buttons
  buttons: {},
  // Keeps a running count of how many months are in this.calendars
  months: 0,
  // Keeps the current (centermost) date used
  date: null,
  // Keeps a copy of the date the calendar was at when it was initialized (for resetting)
  originalDate: null,
  // Hash containing the start and end dates for the rnage
  range: {},
  isMousedown: false,
  isDragging: false,
  // Click dragging is when someone clicks on one endpoint, then clicks on the other without dragging in between
  isClickDragging: false,
  
  initialize: function(element, options){
    // Setup & Abandon if no element
    this.element = $(element);
    if (this.element == null) return;
    this.element.addClass('timeframe_calendar')
    
    // Initial Setup
    Timeframes.push(this);
    this.setOptions(options);
    this.element.adopt(new Element('div', {id: this.element.id + "_container"}))
    
    // Set earliest & latest dates
    if (this.options.earliest != null) this.options.earliest = Date.parseToObject(this.options.earliest);
    if (this.options.latest != null) this.options.latest = Date.parseToObject(this.options.latest);
    
    // Build up the buttons & fields
    this.fields = new Hash({ start: $(this.options.startField), end: $(this.options.endField) });
    this._buildButtons();
    this._buildFields();
    
    // Initialize the date & populate the calendars
    this.options.months.times(this.createCalendar.bind(this));
    this.date = new Date();
    // Move the date back if we're going to show past the latest or earliest
    var endDate = new Date(this.date);
    var monthsShownToRight = (this.months/2).toInt();
    var monthsShownToLeft = (this.months/2).toInt();
    if (this.options.latest != null && this.options.latest < endDate.setMonth(this.date.getMonth() + monthsShownToRight))
      this.date.setMonth(this.options.latest.getMonth() - monthsShownToRight);
    if (this.options.earliest != null && this.options.earliest > endDate.setMonth(this.date.getMonth() - monthsShownToLeft))
      this.date.setMonth(this.options.earliest.getMonth() + monthsShownToLeft);
    this.originalDate = new Date(this.date);
    this.range = new Hash();
    this.populate();
    
    // Register event handlers
    this.register();
    this.addEvent('rangeChange', this.handleRangeChange.bind(this));
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
    Populates the active calendars with date numbers
  */
  populate: function(){
    // Set to same hour for all dates
    var month = this.date.neutral();
    // Center the calendar on this date if we have more than 2 calendars showing
    if (this.months > 2) month.setMonth(month.getMonth() - (this.months/2).toInt());
    
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
        dayCell.store('date', date);
        dayCell.set({
          'text': date.getDate(),
          'class': inactive || 'active'
        });
        if ((this.options.earliest && date < this.earliest) || (this.latest && date > this.latest)){
          dayCell.addClass('unselectable');
        }else{
          dayCell.addClass('selectable');
        }
        if (iterator.toString() === new Date().neutral().toString()) dayCell.addClass('today');
        dayCell.store('baseClass', dayCell.get('class'));
        
        // Iterate one day and add class if it's beyond the month
        iterator.setDate(iterator.getDate() + 1);
        if (iterator.getDate() == 1) inactive = inactive ? false : 'post beyond';
      }, this);
      
      // Iterate to the next month
      month.setMonth(month.getMonth() + 1);
    }, this);
    // Update the highlighting UI
    if (this.range.begining != null) this._updateCalendarDisplay();
  },
  
  // Internal function to create buttons used for calendar navigation
  _buildButtons: function(){
    this.buttons = new Hash({
      previous: { label: '←', element: $(this.options.previousButton) },
      today:    { label: 'T',      element: $(this.options.todayButton) },
      reset:    { label: 'R',      element: $(this.options.resetButton) },
      next:     { label: '→', element: $(this.options.nextButton) }
    })
    
    var buttonList = new Element('ul', {id: this.element.id + '_menu', className: 'timeframe_menu'});
    this.buttons.each(function(value, key){
      if (value.element != null){
        value.element.addClass('timeframe_button').addClass(key)
      }else{
        var item = new Element('li');
        var button = new Element('a', {'class': 'timeframe_button ' + key, href: '#', text: value.label});
        this.buttons[key].element = button;
        item.adopt(button);
        buttonList.adopt(item);
      }
    }, this);
    
    this.element.grab(buttonList, 'top')
  },
  
  // Internal function to build the fields used for start/end dates
  _buildFields: function(){
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
  },
  
  /*
    Function: markEndPoint
    Marks a given date as the endpoint for the range
  */
  markEndPoint: function(date){
    // Are we just starting?
    if (this.range.get('begining') == null){
      this.range.set('start', date);
      this.range.set('begining', date);
    // If the date is further than our start date
    }else if(this.range.get('start') <  date){
      if (this.range.get('start') < this.range.get('begining')) this.range.set('start', this.range.get('begining'));
      this.range.set('end', date);
    // Otherwise the date is before our start date
    }else{
      if (date >= this.range.get('begining') || this.range.get('end') == null) this.range.set('end', this.range.get('start'));
      this.range.set('start', date);
    }
    this.fireEvent('rangeChange');
  },
  
  /*
    Function handleRangeChange
    Gets fired whenever the date range changes.
  */
  handleRangeChange: function(){
    this._updateCalendarDisplay();
  },
  
  // Responsible for updating the classes & display of the active dates on the calendar
  _updateCalendarDisplay: function(){
    this.element.getElements('td').each(function(td){
      td.set('class', td.retrieve('baseClass'));
      
      // Did we just create a singlular range?
      if (this.range.get('start') != null && this.range.get('end') == null){
        if (td.retrieve('date') == this.range.get('start')) td.addClass('startendrange')
        return;
      }

      // Are we inside the range?
      if (td.retrieve('date') < this.range.get('start') || td.retrieve('date') > this.range.get('end')) return;
      
      if (td.retrieve('date') == this.range.get('start')) td.addClass('startrange')
      if (td.retrieve('date') == this.range.get('end')) td.addClass('endrange');
      if (this.isDragging) td.addClass('stuck');
      else td.addClass('selected');
    }, this);
  }
});

/*
  Timeframe.Events
  Contains all of the DOM events based functionality for Timeframe. Mixed into Timeframe class.
*/
Timeframe.Events = {
  // Registers the events
  register: function(){
    this.element.addEvent('mousedown', this.handleMouseDown.bind(this));
    this.element.addEvent('mouseover', this.handleMouseOver.bind(this));
    document.addEvent('mouseup', this.handleMouseUp.bind(this));
    this.fields.each(function(field){
      field.addEvent('focus', this.handleFieldFocus.bind(this));
      field.addEvent('blur', this.handleFieldBlur.bind(this));
      field.addEvent('keyup', this.handleFieldChange.bind(this));
    }, this);
    this.buttons.today.element.addEvent('click', this.handleTodayClick.bind(this));
    this.buttons.reset.element.addEvent('click', this.handleResetClick.bind(this));
    this.buttons.next.element.addEvent('click', this.handleNextClick.bind(this));
    this.buttons.previous.element.addEvent('click', this.handlePreviousClick.bind(this));
    this._disableTextSelection();
  },
  
  // Listens to mousedowns inside this.element
  handleMouseDown: function(event){
    var element = $(event.target);
    var el;
    // Are we clicking/dragging a date?
    if (el = element.hasClass('selectable') ? element : element.getParent('td.selectable')){
      // Clear the range if we're clicking to make a new range
      if (!this.isDragging && this.range.get('start') != null && this.range.get('end') != null) this.range.empty();
       this.isClickDragging = this.range.get('begining') == null
      this.isMouseDown = this.isDragging= true;
      this.markEndPoint(el.retrieve('date'));
    }
  },
  
  // Listens to mouseovers inside this.element
  handleMouseOver: function(event){
    var element = $(event.target);
    var el;
    // We dragging over a selectable thing?
    if (this.isDragging && (el = element.hasClass('selectable') ? element : element.getParent('td.selectable'))){
      if (this.range.get('begining') != el.retrieve('date') && this.isMouseDown) this.isClickDragging = false;
      this.markEndPoint(el.retrieve('date'));
    }
  },
  
  // Listens to all mouseups for the document
  handleMouseUp: function(event){
    if (!this.isClickDragging) this.isDragging = false;
    this.isMouseDown = false;
    this.fireEvent('rangeChange');
  },
  
  // Handles when a field gains focus
  handleFieldFocus: function(){
    
  },
  
  // Handles when a field loses focus
  handleFieldBlur: function(){
    
  },
  
  // Handles when a field's value changes
  handleFieldChange: function(){
    
  },
  
  // Resets the calendar to it's initial state
  handleResetClick: function(event){
    this.range.empty();
    this.date.setMonth(this.originalDate.getMonth());
    this.populate();
    this._updateCalendarDisplay();
  },
  
  // Fast-forwards to today in center
  handleTodayClick: function(event){
    if (event) event.stop();
    this.date.setMonth((new Date()).getMonth())
    this.populate();
  },
  
  // Fast-forwards to the next months
  handleNextClick: function(event){
    if (event) event.stop();
    this.date.setMonth(this.date.getMonth() + 1);
    this.populate();
  },
  
  // Fast-forwards to the previous months
  handlePreviousClick: function(event){
    if (event) event.stop();
    this.date.setMonth(this.date.getMonth() - 1);
    this.populate();
  },
  
  _disableTextSelection: function() {
    if (Browser.Engine.trident){
      this.element.onselectstart = function(event) {
        if (!/input|textarea/i.test((new Event(event)).target.tagName)) return false;
      }
    }else{
      this.element.onmousedown = function(event) {
        if (!/input|textarea/i.test((new Event(event)).target.tagName)) return false;
      }
    }
    return this;
  }
}
Timeframe.implement(Timeframe.Events);

$extend(Date, {
  parseToObject: function(string) {
    var date = Date.parse(string);
    if (!date) return null;
    date = new Date(date);
    return (date == 'Invalid Date' || date == 'NaN') ? null : date.neutral();
  }
})
$extend(Date.prototype, {
  neutral: function() {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 12);
  }
});
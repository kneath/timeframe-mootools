/*
  Script: specs.js
    Specs for TimeFrame

  License:
    MIT-style license.
*/

var setupHTML = function(){
  var html = '<div id="calendar"></div>';
  document.body.appendChild(new Element('div', {id: 'htmlWrapper', style:'display:none', html: html}))
}
var teardownHTML = function(){
  $('htmlWrapper').dispose();
}

describe("Initialization", {
  'before each': function(){
    setupHTML();
  },
  'after each': function(){
    Timeframes = [];
    teardownHTML();
  },
  
  'should push new instances to the Timeframe object': function(){
    var old_count = Timeframes.length;
    Instance = new Timeframe('calendar');
    value_of(Timeframes.length).should_be(old_count + 1);
  },
  
  'options sanity check': function(){
    Instance = new Timeframe('calendar', {months: 42});
    value_of(Instance.options.months).should_be(42);
  }
});

describe("HTML Scaffolding with default options", {
  'before all': function(){
    setupHTML();
    Instance = new Timeframe('calendar');
  },
  'after all': function(){
    teardownHTML();
  },
  
  'should build the proper buttons': function(){
    var buttonList = $('calendar_menu');
    value_of(buttonList).should_not_be(null);
    value_of(buttonList.getElement('li a.previous')).should_not_be(null);
    value_of(buttonList.getElement('li a.today')).should_not_be(null);
    value_of(buttonList.getElement('li a.reset')).should_not_be(null);
    value_of(buttonList.getElement('li a.next')).should_not_be(null);
  },
  
  'should build the proper fields': function(){
    var fieldsContainer = $('calendar_fields');
    value_of(fieldsContainer).should_not_be(null);
    value_of(Instance.fields.start).should_not_be(null);
    value_of(Instance.fields.end).should_not_be(null);
    value_of(fieldsContainer.getElement('input.start')).should_be(Instance.fields.start);
    value_of(fieldsContainer.getElement('input.end')).should_be(Instance.fields.end);
  }
});

describe("HTML Scaffolding with custom buttons & fields", {
  'before each': function(){
    setupHTML();
    var extraHTML = '<a href="#" id="ooglyPrevious">Previously...</a><a href="#" id="ooglyToday">Today...</a><a href="#" id="ooglyReset">Reset...</a><a href="#" id="ooglyNext">Next...</a>';
    extraHTML += '<input type="text" id="ooglyStart" /><input type="text" id="ooglyEnd" />'
    document.body.appendChild(new Element('div', { html:extraHTML, style: 'display:none' }));
  },
  'after each': function(){
    teardownHTML();
  },
  
  'should build the proper buttons given ids': function(){
    Instance = new Timeframe('calendar', {
      previousButton: 'ooglyPrevious',
      todayButton: 'ooglyToday',
      resetButton: 'ooglyReset',
      nextButton: 'ooglyNext'
    });
    value_of($('ooglyPrevious').hasClass('timeframe_button')).should_be(true);
    value_of($('ooglyPrevious').hasClass('previous')).should_be(true);
    value_of($('ooglyToday').hasClass('timeframe_button')).should_be(true);
    value_of($('ooglyToday').hasClass('today')).should_be(true);
    value_of($('ooglyReset').hasClass('timeframe_button')).should_be(true);
    value_of($('ooglyReset').hasClass('reset')).should_be(true);
    value_of($('ooglyNext').hasClass('timeframe_button')).should_be(true);
    value_of($('ooglyNext').hasClass('next')).should_be(true);
  },
  
  'should build the proper fields given ids': function(){
    Instance = new Timeframe('calendar', {
      startField: 'ooglyStart',
      endField: 'ooglyEnd'
    });
    value_of(Instance.fields.start).should_not_be(null);
    value_of(Instance.fields.end).should_not_be(null);
    value_of($('ooglyStart')).should_be(Instance.fields.start)
    value_of($('ooglyEnd')).should_be(Instance.fields.end)
  }
})
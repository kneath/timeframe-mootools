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
  
  'pushes new instances to the Timeframe object': function(){
    var old_count = Timeframes.length;
    Instance = new Timeframe('calendar');
    value_of(Timeframes.length).should_be(old_count + 1);
  },
  
  'options are sane': function(){
    Instance = new Timeframe('calendar', {weekOffset: 42});
    value_of(Instance.options.weekOffset).should_be(42);
  },
  
  'earliest and latest parse strings': function(){
    firstDate = new Date(1954, 6, 1, 12); // Remember, months are 0 based
    lastDate = new Date(1984, 6, 17, 12);
    Instance = new Timeframe('calendar', {earliest: "July 1, 1954", latest: "July 17, 1984"});
    
    value_of(Instance.options.earliest).should_be(firstDate);
    value_of(Instance.options.latest).should_be(lastDate);
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
  
  'builds the proper buttons': function(){
    var buttonList = $('calendar_menu');
    value_of(buttonList).should_not_be(null);
    value_of(buttonList.getElement('li a.previous')).should_not_be(null);
    value_of(buttonList.getElement('li a.today')).should_not_be(null);
    value_of(buttonList.getElement('li a.reset')).should_not_be(null);
    value_of(buttonList.getElement('li a.next')).should_not_be(null);
  },
  
  'builds the proper fields': function(){
    var fieldsContainer = $('calendar_fields');
    value_of(fieldsContainer).should_not_be(null);
    value_of(Instance.fields.start).should_not_be(null);
    value_of(Instance.fields.end).should_not_be(null);
    value_of(fieldsContainer.getElement('input.start')).should_be(Instance.fields.start);
    value_of(fieldsContainer.getElement('input.end')).should_be(Instance.fields.end);
  },
  
  'builds out two calendar tables': function(){
    value_of(Instance.element.getElements('table').length).should_be(2);
  },
  
  'lists out the seven days of the week': function(){
    var headings = Instance.element.getElement('table').getElements('th');
    value_of(headings.length).should_be(7);
    value_of(headings[0].get('text')).should_be('S')
    value_of(headings[0].get('abbr')).should_be('Sunday')
    value_of(headings[1].get('text')).should_be('M')
    value_of(headings[1].get('abbr')).should_be('Monday')
    value_of(headings[2].get('text')).should_be('T')
    value_of(headings[2].get('abbr')).should_be('Tuesday')
    value_of(headings[3].get('text')).should_be('W')
    value_of(headings[3].get('abbr')).should_be('Wednesday')
    value_of(headings[4].get('text')).should_be('T')
    value_of(headings[4].get('abbr')).should_be('Thursday')
    value_of(headings[5].get('text')).should_be('F')
    value_of(headings[5].get('abbr')).should_be('Friday')
    value_of(headings[6].get('text')).should_be('S')
    value_of(headings[6].get('abbr')).should_be('Saturday')
  },
  
  'inserts 6 rows of tds and 1 row of trs': function(){
    var trs = Instance.element.getElement('table').getElements('tr');
    value_of(trs.length).should_be(7);
  },
  
  'fills in the calendars caption': function(){
    var first_caption = Instance.element.getElements('caption')[0];
    var second_caption = Instance.element.getElements('caption')[1];
    value_of(first_caption.get('text').length > 1).should_be(true);
    value_of(second_caption.get('text').length > 1).should_be(true);
  },
  
  'fills in calendar tables with last month and this month': function(){
    
  }
});

describe("HTML Scaffolding with custom buttons & fields", {
  'before each': function(){
    setupHTML();
    var extraHTML = '<a href="#" id="ooglyPrevious">Previously...</a><a href="#" id="ooglyToday">Today...</a><a href="#" id="ooglyReset">Reset...</a><a href="#" id="ooglyNext">Next...</a>';
    extraHTML += '<input type="text" id="ooglyStart" /><input type="text" id="ooglyEnd" />'
    document.body.appendChild(new Element('div', { id: 'extraHTML', html:extraHTML, style: 'display:none' }));
  },
  'after each': function(){
    teardownHTML();
    $('extraHTML').dispose();
  },
  
  'builds the proper buttons given ids': function(){
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
  
  'builds the proper fields given ids': function(){
    Instance = new Timeframe('calendar', {
      startField: 'ooglyStart',
      endField: 'ooglyEnd'
    });
    value_of(Instance.fields.start).should_not_be(null);
    value_of(Instance.fields.end).should_not_be(null);
    value_of($('ooglyStart')).should_be(Instance.fields.start)
    value_of($('ooglyEnd')).should_be(Instance.fields.end)
  }
});

describe("Week offset by 2 days", {
  'before all': function(){
    setupHTML();
    Instance = new Timeframe('calendar', { weekOffset: 2 });
  },
  'after all': function(){
    teardownHTML();
  },
  
  
  'lists out the seven days of the week': function(){
    var headings = Instance.element.getElement('table').getElements('th');
    value_of(headings[0].get('abbr')).should_be('Tuesday')
    value_of(headings[1].get('abbr')).should_be('Wednesday')
    value_of(headings[2].get('abbr')).should_be('Thursday')
    value_of(headings[3].get('abbr')).should_be('Friday')
    value_of(headings[4].get('abbr')).should_be('Saturday')
    value_of(headings[5].get('abbr')).should_be('Sunday')
    value_of(headings[6].get('abbr')).should_be('Monday')
  }
});

describe("Ranges", {
  'before all': function(){
    setupHTML();
    Instance = new Timeframe('calendar', { weekOffset: 2 });
    DateEarliest = new Date(2008, 10, 5, 12);
    DateEarlier = new Date(2008, 10, 6, 12)
    DateMiddle = new Date(2008, 10, 7, 12);
    DateLater = new Date(2008, 10, 8, 12);
    DateLatest = new Date(2008, 10, 9, 12);
  },
  'after all': function(){
    teardownHTML();
  },
  
  'sets the start of a range if it is empty': function(){
    Instance.range.empty();
    Instance.markEndPoint(DateEarliest);
    value_of(Instance.range.get('start')).should_be(DateEarliest);
    value_of(Instance.range.get('end')).should_be(null);
  },
  
  'sets the end of a range if you already set the start, and are after it': function(){
    Instance.range.empty();
    Instance.markEndPoint(DateEarliest);
    Instance.markEndPoint(DateLatest);
    value_of(Instance.range.get('start')).should_be(DateEarliest);
    value_of(Instance.range.get('end')).should_be(DateLatest);
  },
  
  'swaps the endpoints of a range if you mark a point before the start': function(){
    Instance.range.empty();
    Instance.markEndPoint(DateLatest);
    Instance.markEndPoint(DateEarliest);
    value_of(Instance.range.get('start')).should_be(DateEarliest);
    value_of(Instance.range.get('end')).should_be(DateLatest);
  },
  
  'contracts the range if you move back from the latest': function(){
    Instance.range.empty();
    Instance.markEndPoint(DateEarliest);
    Instance.markEndPoint(DateLatest);
    Instance.markEndPoint(DateLater);
    value_of(Instance.range.get('start')).should_be(DateEarliest);
    value_of(Instance.range.get('end')).should_be(DateLater);
  },
  
  'extends a range forward from begining if going forward/backward/forward': function(){
    Instance.range.empty();
    Instance.markEndPoint(DateMiddle);
    Instance.markEndPoint(DateLater);
    Instance.markEndPoint(DateEarlier);
    Instance.markEndPoint(DateLatest);
    value_of(Instance.range.get('start')).should_be(DateMiddle);
    value_of(Instance.range.get('end')).should_be(DateLatest);
  }
});
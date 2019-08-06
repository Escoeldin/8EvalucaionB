// JavaScript Document
	var containerId;
	var classId;
	var handler;
	
	function getRealmList(containerid){
		containerId = containerid;
		$.ajax({
			url: url + "realm/status",
			data: {jsonp: "populateRealmList"},
			type: 'GET',
			dataType: 'jsonp'
		});	
	}
	
	function populateRealmList(obj) {
		var realms = obj.realms;
		var realm, selected;
		$('#'+containerId).empty();

		for(var idx = 0; idx < realms.length; idx++){
			selected="";
			realm = realms[idx];
			if(realm.name=="Stormrage"){ selected = " selected ";}
			$('#'+containerId).append( "<option" + selected + ">" + realm.name + "</option>");		
		}
	}

	function getCharecter(server, name, handlerMethod){
		handler=handlerMethod;
		var baseUrl = url + "character/" + server + "/" + name;
		$.ajax({
			url: baseUrl,
			dataType:"jsonp",
			data:  {fields: "items", jsonp: "returnData" }
		});
	}

	function getGuild(server, name, handlerMethod){
	//	handler=handlerMethod;
	//	var baseUrl = url + "character/" + server + "/" + name;
	//	$.ajax({
	//		url: baseUrl,
	//		dataType:"jsonp",
	//		data:  {fields: "guild", jsonp: "returnData" }
	//	});
	}

	function getGuildRoster(server, name, handlerMethod){
		handler=handlerMethod;
		var baseUrl = url + "guild/" + server + "/" + name;
		$.ajax({
			url: baseUrl,
			dataType:"jsonp",
			data:  {fields: "members", jsonp: "returnData" }
		});
	}
	
	function loadBNETCharecter(server, name, handlerMethod){
		handler=handlerMethod;
		
	}
	
	function returnData(data){
		handler(data);
	}

	function getAppearance(){
		var realm = $("#realmList").val();
		var charecter = $("#charName").val();
		var baseUrl = url + "character/" + realm + "/" + charecter;
		$.ajax({
			url: baseUrl,
			dataType:"jsonp",
			data:  {fields: "appearance", jsonp: "displayCharecterAppearance" }
		});
	}

	function displayCharecterData(data){
		$("#thumbnail").attr("src", "http://us.battle.net/static-render/us/" + data.thumbnail);
		$("#Name").html("").html(data.name);
		$("#Server").html("").html(data.realm);
		$("#Level").html("").html(data.level);
		getClassById(data.class);

		//$('#appendData').html(JSON.stringify(data.items));
		$('#appendData').html(JSON.stringify(data));
	}
	
	function displayCharecterAppearance(data){
		$('#appendData').html(JSON.stringify(data));	
	}
	
	function getClassById(id){
		classId = id;
		$.ajax({
			url:  url + "data/character/classes",
			data: {jsonp: 'getClasses'},
			type: 'GET',
			dataType: 'jsonp'
		});	
	}
	
	function getClasses(obj){
		//$("#appendData").append(JSON.stringify(obj));
		var charClass;
		for(var idx = 0; idx < obj.classes.length; idx++){
			charClass = obj.classes[idx];
			if(charClass.id==classId){
				$("#Class").html("").html(charClass.name);
			}
		}			
	}


var url = 'https://us.battle.net/api/wow/';
var avatarImageBase = 'http://us.battle.net/static-render/us/';
var iconUrlBase = 'http://media.blizzard.com/wow/icons/56/';

$(document).ready(function() {
  $("#charName").val('Sindrane');
  $(".armory-errors-container").css('display', 'none');
  $(".item, .hands").mouseover(function() {
    stopAllItemStatSlides();
    $(this).find(".itemstats:first").stop().slideDown();
  });
  $(".item, .hands").mouseout(function() {
    $(this).find(".itemstats:first").stop().slideUp();
  });

  //offset
  stopAllItemStatSlides();
  bindClickEvents();
  getRealmList('servers');
  $(".itemstats").each(function() {
    $(this).css("top", ($(this).height * .75)).css("left", ($(this).width * .75));
  });
  $(window).resize(function() {
    //handleResize();
  });
});

function bindClickEvents() {
  $("#charecter-search").click(function() {
    // for now just show the error screen
    loadCharecter();
  });
  $("#btn-error-continue").click(function() {
    $(".armory-errors-container").fadeOut(50);
  });

  $(".debug-info-menu").click(function(e) {
    showDebugElement(e.target.id);
  });
}

function stopAllItemStatSlides() {
  $(".itemstats").css("display", "none");
}

function loadCharecter() {
  if ($("#charName").val().length < 1) {
    showError('Invalid charecter name');
  } else {
    getCharecter($("#servers").val(), $("#charName").val(), populateCharecterData);
  }
}

function populateCharecterData(data) {
  $("#debug-output-character").html("").html(JSON.stringify(data));
  if (!$("#debug-character-output").is(":visible")) {
    $("#debug-character-output").slideToggle();
  }
  if ($("debug-guild-output").is(":visible")) {
    $("debug-guild-output").slideToggle();
  }
  $("#character-debug-data").addClass("debug-info-menu-active");
  getCharecterStats(data);
  getCharecterGear(data);
  updateAvatarImage(data);
  getGuild(data);
}

function showError(msg) {
  alert('yup');
  $("#armory-err-message").html("").html(msg);
  $(".armory-errors-container").fadeIn(50);
}

function getCharecterStats(data) {
  $(".charecter-name").html("").html(data.name);
  $("#paperdoll-ilvl").html("").html("iLvl:&nbsp;&nbsp;" + data.items.averageItemLevel);
  $("#paperdoll-server").html("").html("Realm:&nbsp;&nbsp;" + data.realm);
  getGuild(data.realm, data.name, processCharacterGuild);
}

function processCharacterGuild(data) {
  alert(JSON.stringify);
  //$("#paperdoll-guild").html("").html("Guild:&nbsp;&nbsp;" + "");
}

function getCharecterGear(data) {
  updateGearInfo("item", data);
  updateGearInfo("hands", data);
}

function updateGearInfo(container, data) {
  var divId;
  $("." + container).each(function() {
    divId = $(this).attr("id");
    if (typeof(data.items[divId]) !== 'undefined') {
      $("#" + divId).css("background-image", getItemIconUrl(data, divId));
      getItemQuality(data, divId);
      populateItemStats(data, divId);
    } else {
      // should probably put in the default empty container.
    }
  })
}

function getItemIconUrl(data, itemSlot) {
  var url = '';
  try {
    url = 'url("' + iconUrlBase + data.items[itemSlot].icon + '.jpg' + '")';
  } catch (e) {
    url = '';
  }
  return url;
}

function getItemQuality(data, itemSlot) {
  try {
    itemQualityOutline(data.items[itemSlot].quality, itemSlot);
  } catch (e) {}
}

function itemQualityOutline(itemQuality, container) {
  var qualColor = {
    1: "white",
    2: "green",
    3: "blue",
    4: "purple",
    7: "gold"
  };

  try {
    $("#" + container).css("border-color", qualColor[itemQuality]).css("border-size", "1px");
  } catch (e) {
    if (e.message.substr(0, 12) == 'Syntax error') {
      $("." + container).css("border-color", qualColor[itemQuality]).css("background-color", qualColor[itemQuality]);
    } else {

    }
  }

  return qualColor[itemQuality];
}

function populateItemStats(data, itemSlot) {
  var dataItem = data.items[itemSlot];
  var container = $("#" + itemSlot).find(".itemstats");
  try {
    itemQualityOutline(data.items[itemSlot].quality, $(container));
  } catch (e) {}
  $(container).html("").html("hi!");

}

function updateAvatarImage(data) {
  var paperdoll = $(".paperdoll");
  var imgCharecter = $(".portrait");

  imgCharecter.attr('src', avatarImageBase + data.thumbnail.replace('avatar', 'profilemain'));
  $(".paperdoll-container").css("position", "relative");
  imgCharecter.css("width", (paperdoll.height() * imgCharecter.width()) / imgCharecter.height()).css("height", paperdoll.height());
  imgCharecter.css("margin-left", "-100%").css("margin-right", "-100%");
  imgCharecter.parent().css("overflow", "hidden");
}

// refactoring the show-hide statements for the debug menu
function showDebugElement(element) {
  $(".debug-info-menu").each(function() {
    if ($(this).attr("id").replace("debug-menu-", " ") === element.replace("debug-menu-", " ")) {
      $(this).addClass('debug-info-menu-active');
    } else {
      $(this).removeClass('debug-info-menu-active');
    }

    $(".debug-output").each(function() {
      if ($(this).attr("id").replace("debug-output-", " ") === element.replace("debug-menu-", " ")) {
        if (!$(this).is(":visible")) {
          alert($(this).attr("id"));
          $(this).slideToggle();
        }
      } else {
        if ($(this).is(":visible")) {
          $(this).slideToggle();
        }
      }
    })
  });
}
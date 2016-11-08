({
	doInit : function(component, event, helper) {
		helper.doInit(component, event, helper);
	},

	addItem : function(component, event, helper){
		
		var max = component.get("v.max");
		var itemList = component.get("v.itemList");
		if(itemList.length >= max){
			return;
		}

		helper.addItem(component);
	},

	saveItemList : function(component, event, helper){
		var validate = helper.validateFields(component);
		var validationErrorEvent = $A.get("e.c:validationError");
		if(!validate){
			helper.writeMessage(component,'error','Check fields', 'There are some errors on object fields. Check them and retry.');
			validationErrorEvent.setParams({"status" : false});
		} else {
			validationErrorEvent.setParams({"status" : true});
		}
		validationErrorEvent.fire();
		
		var isExternal = false;
        
        if(validate){
        	helper.saveItemList(component, event, helper, isExternal);
        }
	},

	validateFields : function(component, event, helper){
		var validate = helper.validateFields(component);
		var validationErrorEvent = $A.get("e.c:validationError");
		if(!validate){
			validationErrorEvent.setParams({"status" : false});
		} else {
			validationErrorEvent.setParams({"status" : true});
		}
		validationErrorEvent.fire();
	},

	handleChangeFieldValue : function(component, event, helper){
		var newItem = event.getParam("item");
		var propertyChanged = event.getParam("propertyChanged");
		var itemList = component.get('v.itemList');
		var item = itemList[newItem.index];
		item.obj[propertyChanged] = newItem.obj[propertyChanged];
		item.fieldProperties[propertyChanged].hasError = newItem.fieldProperties[propertyChanged].hasError;
	},

	handleRemoveItem : function(component, event, helper){
		var itemToRemove = event.getParam("item");
		var itemList = component.get('v.itemList');
		
		if(itemToRemove.obj.Id){
			itemList[itemToRemove.index].toBeRemoved = true;
			component.set('v.itemList', itemList);
			return true;
		}
		

		if (itemToRemove.index > -1) {
		    itemList.splice(itemToRemove.index, 1);
		}

		for (var i = itemList.length - 1; i >= 0; i--) {
			itemList[i].index = i;
		}

		component.set('v.itemList', itemList);

	},

	externalSaveItemList : function(component, event, helper){
		var itemList = component.get("v.itemList");
		var fieldMap = component.get("v.fieldMap");
		var objName = component.get("v.objName");
		var params = event.getParam('arguments');

		//FraCarma: assign the value passed as arguments to all items
        if (params) {
        	for (var i = 0; i < itemList.length; i++) {
	        	for (var property in params.fieldList) {
				    if (fieldMap.hasOwnProperty(property)) {
						//FraCarma: to add a new property and pass it to the Apex controller, I need
						// to create a copy of the object and not modify it by reference...
						var item = JSON.parse(JSON.stringify(itemList[i]));
						item.obj[property] = params.fieldList[property];
						itemList[i] = item;
						console.log(itemList[i].obj);			    
				    } else {
				    	console.log('Warning: there is no field '+property+' on object '+objName);
				    }
				}
        	}
        }
        var itemList = component.set("v.itemList", itemList);
        var isExternal = true;
        helper.saveItemList(component, event, helper, isExternal);
	},

	getObjectsList : function(component, event, helper){
		return component.get("v.itemList");
	},

	showSpinner : function (component, event, helper) {
		helper.showSpinner(component); 
    },

    hideSpinner : function (component, event, helper) {
		helper.hideSpinner(component); 
    },

    fireReturnItemListEvent : function (component, event, helper){
    	var itemList = component.get("v.itemList");
		var action = component.get("c.formatSObjectList");
        
        var objList = [];
		for(var i in itemList){
			objList[i] = itemList[i].obj;
		}
        
        action.setParams({
        	"itemList" : objList,
        });
		
        action.setCallback(this, function(res){
        	var state = res.getState();
    		var msg = component.find("errors");

        	var severity = '';
        	var body = {};
        	if(state != "SUCCESS"){
        		severity = 'error';
        		body = res.getError();
        	}
        	if(state == 'SUCCESS'){
        		severity = 'confirm';
        		body = res.getReturnValue();

    			var event = $A.get("e.c:returnItemList");
        		event.setParams({ itemList : body});
				event.fire();
        	}
    		var title = 'Item list';
            var message = 'the server returned:\n'+JSON.stringify(body,null, '  ');
			helper.writeMessage(component, severity, title, message);
	    });

	    $A.enqueueAction(action);
    }
})
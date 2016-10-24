({
	initializeWrapper : function(component, newItem){
		var fieldList = component.get('v.fieldList');
		var fieldMap = component.get("v.fieldMap");
		newItem.fieldProperties = {};
		/*Fracarma: If there is a field in the fieldlist which is not present in the object,
		I add it*/
		for (var i in fieldList){
			if(!newItem.fieldProperties[fieldList[i].name]){
				newItem.fieldProperties[fieldList[i].name] = {};
			}
			newItem.fieldProperties[fieldList[i].name].hasError = false; 

			if (!newItem.obj.hasOwnProperty(fieldList[i].name) && fieldMap.hasOwnProperty(fieldList[i].name)) {
				newItem.obj[fieldList[i].name] = '';
			}
		}

	},
	/**
	* I have got no ID to link the new items with the returned objects. So, I recreate the items from scrath
	*/
	createItemFromObj : function(component, obj, index){
		
		
		var newItem = {};
		newItem.obj = JSON.parse(JSON.stringify(obj));
		this.initializeWrapper(component, newItem);
		newItem.index = index;
		newItem.toBeRemoved = (obj.toBeRemoved) ? true : false;
		return newItem
	},

	addItem : function(component) {
		
		var itemList = component.get('v.itemList');
		var obj = component.get('v.obj');
		var newItem = {};
		newItem.obj = JSON.parse(JSON.stringify(obj));

		var fieldList = component.get('v.fieldList');
		var fieldMap = component.get("v.fieldMap");
		newItem.fieldProperties = {};
		/*Fracarma: If there is a field in the fieldlist which is not present in the object,
		I add it*/
		for (var i in fieldList){
			if(!newItem.fieldProperties[fieldList[i].name]){
				newItem.fieldProperties[fieldList[i].name] = {};
			}
			newItem.fieldProperties[fieldList[i].name].hasError = false; 

			if (!newItem.obj.hasOwnProperty(fieldList[i].name) && fieldMap.hasOwnProperty(fieldList[i].name)) {
				newItem.obj[fieldList[i].name] = '';
			}
		}

		newItem.index = itemList.length;
		newItem.toBeRemoved = (obj.toBeRemoved) ? true : false;
		itemList.push(newItem);
		component.set('v.itemList', itemList);
	},


	setStandardCallback : function(res) {

		var state = res.getState();
		var severity = '';
    	var body = {};
    	if(state != "SUCCESS"){
    		severity = 'error';
    		body = res.getError();
    	}
    	if(state == 'SUCCESS'){
    		severity = 'Server responded confirming : ';
    		body = res.getReturnValue();
    	}
		console.log(severity + ' : ' + JSON.stringify(body));
		return state;
	},

	getObjInfos : function(component, next){
		var obj = component.get("v.obj");
		var action = component.get("c.getObjectFieldMap");
		action.setParams({
			"item" : obj
		});

		action.setCallback(this, function(res){
			var state  = this.setStandardCallback(res);
			if(state == 'SUCCESS'){
				component.set("v.fieldMap", res.getReturnValue());
				next(component);
			}
		});

		$A.enqueueAction(action);

		var action2 = component.get("c.getObjectName");
		action2.setParams({
			"item" : obj
		});

		action2.setCallback(this, function(res){
			var state  = this.setStandardCallback(res);
			if(state == 'SUCCESS'){
				component.set("v.objName", res.getReturnValue());
			}

		});

		$A.enqueueAction(action2);
	},

	handleReturnedObj : function(component,body){
		var itemList = [];
		for (var i = body.length - 1; i >= 0; i--) {
			itemList[i] = this.createItemFromObj(component,body[i], i);
		}
		return itemList;
	},

	saveItemList : function(component, event, helper, isExternalRequest){
		var itemList = component.get('v.itemList');
		var itemToBeSavedList = itemList.filter(function(item){
			return !item.toBeRemoved;
		})
		var itemToBeRemovedList = itemList.filter(function(item){
			return item.toBeRemoved;
		})
		

		var objToBeSavedList = [];
		for(var i in itemToBeSavedList){
			objToBeSavedList[i] = itemToBeSavedList[i].obj;
		}

		var objToBeRemovedList = [];
		for(var i in itemToBeRemovedList){
			objToBeRemovedList[i] = itemToBeRemovedList[i].obj;
		}
		
		console.log('saveList : '+JSON.stringify(objToBeSavedList));
		console.log('removeList : '+JSON.stringify(objToBeRemovedList));

		var action = component.get("c.saveItems");
        action.setParams({
        	"itemToBeSavedList" : objToBeSavedList,
        	"itemToBeRemovedList" : objToBeRemovedList
        });

		var button = component.find("saveButton");
		if(button){
			button.set("v.label", "Saving...");
			button.set("v.disabled", true);
		}

        action.setCallback(this, function(res){
        	var state = res.getState();
    		var msg = component.find("errors");

        	var severity = '';
        	var body = {};
        	var title = '';
        	if(state != "SUCCESS"){
        		severity = 'error';
        		body = res.getError();
        		title = 'An error has occurred';
        	}
        	if(state == 'SUCCESS'){
        		severity = 'confirm';
                body = res.getReturnValue();
        		title = "Item list saved!";
        		//Recreate the list with the values returned by the server (I need the ID)
        		component.set('v.itemList',helper.handleReturnedObj(component,body));
        		var savedItemListEvent = $A.get("e.c:savedItemList");
        		savedItemListEvent.setParams({"isExternalRequest" : isExternalRequest});
        		savedItemListEvent.fire();
        	}
        	if(button){
	        	button.set("v.label", "Save");
				button.set("v.disabled", false);
        	}
            var message = 'the server returned:\n'+JSON.stringify(body,null, '  ');
        	this.writeMessage(component, severity, title ,message);
	    });


	    $A.enqueueAction(action);
	    

	},

	writeMessage : function(component, severity, title ,body){
        var messages = component.find("messages");
        
        if(!messages){
        	return;
        }

		$A.createComponents(
            [
            	["ui:outputText",
            		{
            			"value" : body
            		}]

            ],
            function(newComponent, status, errorMessage){
                if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                    // Show error message
                }
	        	messages.set("v.severity", severity);
	        	messages.set("v.title", title);
	        	messages.set("v.body", newComponent);
            }
        );
	},

	validateFields : function(component) {
		
		var itemList = component.get("v.itemList");

		var itemInErrorList = itemList.filter(function(value){
			var res = false;
			var fieldProperties = value.fieldProperties;
			for(var property in fieldProperties){
				if(fieldProperties[property].hasError){
					res = true;
				}
			}
			return res;
		});
		return !itemInErrorList.length;
	}

	


})
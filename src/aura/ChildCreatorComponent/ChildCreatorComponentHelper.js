({
	doInit : function(component, event,helper){
		helper.getObjInfos(component, helper);
	},

	manageAfterGetObjectInfosInit: function(component, helper){
		var createRecordOnLoad = component.get("v.createRecordOnLoad");
		var loadExistingRecords = component.get("v.loadExistingRecords");


		if(createRecordOnLoad){
			helper.addItem(component);
		}


		if(loadExistingRecords){
			var action = component.get("c.getExistingRecords");
			var parameterList = loadExistingRecords.split(';');
			var fieldList = component.get("v.fieldList");
			var obj = component.get("v.obj");

			action.setParams({
				"item" : obj,
				"fieldListJSON" : JSON.stringify(fieldList), //I cannot pass the object due to SF bug, that's a workaound
				"parameterList" : parameterList
			});
			action.setCallback(this, function(res){
				var state  = this.setStandardCallback(res);
				if(state == 'SUCCESS'){
		            var body = res.getReturnValue();
	        		var itemList = component.get("v.itemList");
	        		var existingItemList = helper.handleReturnedObj(component,body,true);
	        		for (var i = 0; i < existingItemList.length; i++) {
	        			itemList.push(existingItemList[i]);
	        		}
	        		component.set('v.itemList',itemList);
				}
				if(state != "SUCCESS"){
	        		var severity = 'error';
	        		var body = res.getError();
	        		var title = 'An error has occurred';
	        		var message = 'the server returned:\n'+JSON.stringify(body,null, '  ');
	        		this.writeMessage(component, severity, title ,message);
	        	}
			});
			$A.enqueueAction(action);
		}

	},

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
		newItem.savedObj = JSON.parse(JSON.stringify(newItem.obj));
		return newItem
	},

	addItem : function(component) {
		
		var itemList = component.get('v.itemList');
		var obj = component.get('v.obj');
		var newItem = {};
		newItem.obj = JSON.parse(JSON.stringify(obj));
		//FraCarma: sometimes the helper method "addFields" seems not working when called from here.. DAMN!! 
		var additionalFields = component.get('v.additionalFields');
		if(additionalFields){
			//FraCarma: I define a way to pass the additionalFields as string, the format is: "fieldName1:value1;fieldName2:value2..."
			additionalFields = additionalFields.split(';');
			for (var i = 0; i < additionalFields.length; i++) {
				var field = additionalFields[i].split(':');
				if(!field){
					continue;
				}
				newItem.obj[field[0]] = field[1]; 
			}
		}
	


		

		if(!newItem.obj){
			this.writeMessage(component, 'error', 'Component Error' ,'Check the object format passed to the component.\nContact your System Admin');
			return;
		}

		var fieldList = component.get('v.fieldList');
		var fieldMap = component.get("v.fieldMap");

		if(!fieldMap){
			this.writeMessage(component, 'error', 'No FieldMap found' ,'');
			return;
		}

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
		newItem.savedObj = JSON.parse(JSON.stringify(newItem.obj));
		
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

	getObjInfos : function(component, helper){
		this.showSpinner(component);
		var obj = component.get("v.obj");
		console.log('obj: '+obj);
		var action = component.get("c.getObjectFieldMap");
		action.setParams({
			"item" : obj
		});

		action.setCallback(this, function(res){
        	this.hideSpinner(component);
			var state  = this.setStandardCallback(res);
			if(state == 'SUCCESS'){
				component.set("v.fieldMap", res.getReturnValue());
				helper.manageAfterGetObjectInfosInit(component,helper);
			}
			if(state != "SUCCESS"){
        		severity = 'error';
        		body = res.getError();
        		title = 'An error has occurred';
        		var message = 'the server returned:\n'+JSON.stringify(body,null, '  ');
        		this.writeMessage(component, severity, title ,message);
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

	handleReturnedObj : function(component,body, isAdding){
		var itemList = component.get("v.itemList")
		var newItemList = [];
		for (var i = body.length - 1; i >= 0; i--) {
			var index = (isAdding) ? i + itemList.length : i;
			newItemList[i] = this.createItemFromObj(component,body[i], index);
		}
		return newItemList;
	},

	saveItemList : function(component, event, helper, isExternalRequest){
		this.showSpinner(component);
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

		if(objToBeSavedList.length <= 0 && objToBeRemovedList.length <= 0){
			var savedItemListEvent = $A.get("e.c:savedItemList");
        	savedItemListEvent.setParams({"isExternalRequest" : isExternalRequest});
        	savedItemListEvent.fire();
			return;
		}

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
        	this.hideSpinner(component);
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
        		component.set('v.itemList',helper.handleReturnedObj(component,body,false));
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
	},

	showSpinner : function (component) {
        var spinner = component.find('spinner');
        if(!spinner){
        	return;
        }
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : true });
        evt.fire();    
    },

    hideSpinner : function (component) {
        var spinner = component.find('spinner');
        if(!spinner){
        	return;
        }
        var evt = spinner.get("e.toggle");
        evt.setParams({ isVisible : false });
        evt.fire();    
    },

    addFields : function(component, newItem){
    	var additionalFields = component.get('v.additionalFields');
		if(!additionalFields){
			return newItem;
		}
		//FraCarma: I define a way to pass the additionalFields as string, the format is: "fieldName1:value1;fieldName2:value2..."
		additionalFields = additionalFields.split(';');
		for (var i = 0; i < additionalFields.length; i++) {
			var field = additionalFields[i].split(':');
			if(!field){
				continue;
			}
			newItem.obj[field[0]] = field[1]; 
		}

		return newItem;
    }

	


})
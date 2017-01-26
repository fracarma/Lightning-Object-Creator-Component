({
	doInit : function(component, event, helper) {
		var item = component.get('v.item');
		var fieldList = component.get("v.fieldList");
        var fieldMap = component.get("v.fieldMap");
        var componentList = [];

		for (var i in fieldList){
			if (fieldMap.hasOwnProperty(fieldList[i].name)) {
    			switch(fieldList[i].type){
    				case "inputField" :
    					componentList.push(helper.createInputText(component, item, fieldList[i]));
    				 	break;
    				case "outputField" :
    					componentList.push(helper.createOutputText(component, item, fieldList[i]));
    					break;
    			}
    		}
		}
        helper.createComponents(component, componentList);
	},

    removeItemAction : function(component, event, helper){
        var item = component.get("v.item");
        var arr = component.find("placeholder").get("v.body");
        for (var i = arr.length - 1; i >= 0; i--) {
            //FraCarma : TODO : Refactor this shit

            if(!arr[i].get("v.isInput")){
                continue;
            }
            try{
                arr[i].find("placeholderItem").get("v.body")[0].set("v.disabled", true);
            } catch (err) {
                console.log(err);
                continue;
            }
        }
        
        var removeItemEvent = component.getEvent("removeItemEvent");
        removeItemEvent.setParams({
            "item" : item
        });

        removeItemEvent.fire();
    },

    restoreItemAction : function(component, event, helper){
        var item = component.get("v.item");
        item.toBeRemoved = false;
        var arr = component.find("placeholder").get("v.body");
        for (var i = arr.length - 1; i >= 0; i--) {
            if(!arr[i].get("v.isInput")){
                continue;
            }
            //FraCarma : TODO : Refactor this shit
            try{
                arr[i].find("placeholderItem").get("v.body")[0].set("v.disabled", false);
            } catch (err) {
                console.log(err);
            }
        }
        component.set("v.item", item);
    },

    handleChangeFieldValue : function(component, event, helper){

        var newItem = event.getParam("item");
        var propertyChanged = event.getParam("propertyChanged");
        var item = component.get('v.item');

        item.obj[propertyChanged] = newItem.obj[propertyChanged];
        
        component.set("v.item", item);

        var arr = component.find("placeholder").get("v.body");
        for (var i = arr.length - 1; i >= 0; i--) {
            try{
                arr[i].checkDisabledCondition(item);
            } catch(err){
                console.warn("Error during checkDisabledCondition: ",err);
            }
        }



    },
})
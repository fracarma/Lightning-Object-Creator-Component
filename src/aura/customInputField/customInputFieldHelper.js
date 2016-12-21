({
	createComponents : function (component, newComponentList, helper){

        $A.createComponents(
            newComponentList,
            function(createdNewComponentList,status, errorMessage){
                if (status === "SUCCESS") {
                    
                    var divComponent = component.find("placeholderItem");
                    var divBody = divComponent.get("v.body");
                    
                    for(var i in createdNewComponentList){
                        component.set('v.globalId', createdNewComponentList[i].getGlobalId());
                        divBody.unshift(createdNewComponentList[i]);
                    }
                    
                    divComponent.set("v.body", divBody);
                    helper.checkInput(component,helper,false);
                }
               
                else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                    // Show offline error
                }
                else if (status === "ERROR") {
                    console.log("Error: " + JSON.stringify(errorMessage));
                    // Show error message
                }
            }
        );
    },

    checkInput : function(component,helper, setLabel) {
        var isInput = component.get("v.isInput");
        var required = component.get("v.required");
        var item = component.get("v.item");
        var property = component.get("v.property");

        if(!isInput){
            return;
        }

        var field = component.find("placeholderItem").get("v.body")[0];

        if(required && !field.get("v.value")){
            if(setLabel){
                field.set("v.errors", [{message:"The field is required"}]);
            }
            item.fieldProperties[property].hasError = true;
            helper.fireChangedFieldEvent(component);
        } else {
            field.set("v.errors", null);
            item.fieldProperties[property].hasError = false;
        }

    },
    createPicklistConfig : function(picklistValues) {
        picklistValues = picklistValues.replace(/active/g, "disabled");
        //FraCarma: "selected" seems not working but in DOC it's written that it should!
            // https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/aura_compref_ui_inputSelect.htm
        picklistValues = picklistValues.replace(/defaultValue/g, "selected");
        picklistValues = JSON.parse(picklistValues);
        for(var prop in picklistValues){
            picklistValues[prop]["disabled"] = !picklistValues[prop]["disabled"];
        }
        picklistValues.push({"label": "--- none ---", "value": ""});
        return picklistValues;
    },

    fireChangedFieldEvent : function(component){
        var item = component.get("v.item");
        var property = component.get("v.property");
        
        //FraCarma : TODO : Try to get the created component without this ugly stuff
        item.obj[property] = component.find("placeholderItem").get("v.body")[0].get("v.value");

        var changeFieldValueEvent = component.getEvent("changeFieldValue");
        
        component.set("v.item", item);
        
        changeFieldValueEvent.setParams({
            "item" : item,
            "propertyChanged" : property
        }).fire();
        
    },

    //Fracarma: Recursive method to check if the JSON condition is true or false
    validateCondition : function(condition, item, helper){
        if(!Array.isArray(condition)){
           return helper.assertEquals(condition,item);
        }
        var res = false;
        var logicalOperator = condition[0];
        for (var i = 1; i < condition.length; i++) {

            var loopRes = helper.validateCondition(condition[i], item, helper);
            if(logicalOperator === 'AND'){
                res = (i != 1) ? loopRes && res : loopRes;
            }

            if(logicalOperator === 'OR'){
              res = (i != 1) ? loopRes || res : loopRes;
            }
        }

        return res;
    },
    //fieldAndValueObj = {field : 'fieldName' , value : 'expectedValue'}
    assertEquals : function(fieldAndValueObj, item){
        var field = fieldAndValueObj.field;
        var expectedValue = fieldAndValueObj.value;
        if(!(field in item.obj)){
            throw "The field "+field+" is not in the item";
        }
        var realValue = item.obj[field];
        console.log('field '+field);
        console.log('expectedValue '+expectedValue);
        console.log('realValue '+realValue);
        return expectedValue === realValue;
    }
})
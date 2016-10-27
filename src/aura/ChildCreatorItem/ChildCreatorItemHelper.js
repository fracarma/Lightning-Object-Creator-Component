({
    createComponents : function (component, newComponentList){

        $A.createComponents(
            newComponentList,
            function(createdNewComponentList,status, errorMessage){
                if (status === "SUCCESS") {
                    
                    var divComponent = component.find("placeholder");
                    var divBody = divComponent.get("v.body");
                    
                    for(var i in createdNewComponentList){
                        divBody.push(createdNewComponentList[i]);
                    }
                    
                    divComponent.set("v.body", divBody);
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

    createInputText : function(component, item, fieldDescribe) {
        var property = fieldDescribe.name;
        var fieldMap = component.get("v.fieldMap");
        var label = (fieldMap) ? fieldMap[property].label : 'Label not found';
        var type = (fieldMap) ? fieldMap[property].type  : 'Type not found';
        var picklistValues = (fieldMap && type == 'PICKLIST') ? fieldMap[property].picklistValues  : 'picklistValues not found';
        var value = (item.obj[property]) ? item.obj[property] : '';
        
        var componentConfig = 
            ["c:customInputField",{
              "item" : item,   
              "aura:id" : 'inputField',   
              "property" : property,   
              "value" : value,   
              "placeholder": "Insert "+label,
              "label": label,
              "isInput" : true,
              "required" : fieldDescribe.required,
              "type": type,
              "picklistValues": picklistValues 
            }];

        return componentConfig;
        
    },

    createOutputText : function(component, item, fieldDescribe) {
        var property = fieldDescribe.name;
        var fieldMap = component.get("v.fieldMap");
        var label = (fieldMap) ? fieldMap[property].label  : 'Label not found';
        var type = (fieldMap) ? fieldMap[property].type  : 'Type not found';
        var value = (item.obj[property]) ? item.obj[property] : '';
        var componentConfig = 
            ["c:customInputField", {
              "item" : item,   
              "property" : property,   
              "value" : value,   
              "label": label,
              "type": type
            }];

        return componentConfig;
    }

})
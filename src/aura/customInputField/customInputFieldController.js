({
	doInit : function(component, event, helper){
		var newComponentList = [];
		var componentConfig = [];


        var item = component.get("v.item");
        var type = component.get("v.type");
        var length = component.get("v.length");
        var picklistValues = component.get("v.picklistValues");
        var value = component.get("v.value");
        var label = component.get("v.label");
        var placeholder = component.get("v.placeholder");
        var isInput = component.get("v.isInput");
        var disabled = component.get("v.disabled");
        var required = component.get("v.required");
		var property = component.get("v.property");
		var disabledCondition = component.get("v.disabledCondition");

        
        var componentName = 'ui:inputText';
        var className = '';
        if(isInput){
			componentName = 	(type === 'BOOLEAN') 	? 'ui:inputCheckbox' 	:
								(type === 'DATETIME') 	? 'ui:inputDateTime'  	:
								(type === 'DATE')	 	? 'ui:inputDateTime'  	:
								(type === 'TEXTAREA') 	? 'ui:inputTextArea'  	:
								(type === 'EMAIL')	 	? 'ui:inputEmail'	  	:
								(type === 'PHONE')	 	? 'ui:inputPhone'	  	:
								(type === 'STRING')	 	? 'ui:inputText'	  	:
								(type === 'PICKLIST')	? 'ui:inputSelect'	  	:
								(type === 'INTEGER')	? 'ui:inputNumber'	  	:
								(type === 'DOUBLE')		? 'ui:inputNumber'	  	:
								(type === 'CURRENCY')	? 'ui:inputCurrency'	:
								'ui:inputText';
			
			className = 		(type === 'BOOLEAN') 	? ''	:
								(type === 'TEXTAREA') 	? 'slds-textarea' 	 	:
								(type === 'PICKLIST')	? 'slds-select'		  	:
								'slds-input';

        }
        
        if(!isInput){
			componentName = 	(type === 'BOOLEAN') 	? 'ui:outputCheckbox' 	:
								(type === 'DATETIME') 	? 'ui:outputDateTime'  	:
								(type === 'DATE')	 	? 'ui:outputDateTime'  	:
								(type === 'TEXTAREA') 	? 'ui:outputTextArea'  	:
								(type === 'EMAIL')	 	? 'ui:outputEmail'	  	:
								(type === 'PHONE')	 	? 'ui:outputPhone'	  	:
								(type === 'STRING')	 	? 'ui:outputText'	  	:
								(type === 'PICKLIST')	? 'ui:inputSelect'	  	:
								(type === 'INTEGER')	? 'ui:outputNumber'	  	:
								(type === 'DOUBLE')		? 'ui:outputNumber'	  	:
								(type === 'CURRENCY')	? 'ui:outputCurrency'	:
								'ui:outputText';
        }
        if(disabledCondition){
        	disabled = helper.validateCondition(disabledCondition.condition, item, helper);
        }

        if(!isInput){
        	disabled = true;
        }

        var config = {
              "aura:id": "field",
              "value" : value,   
              "placeholder": placeholder,
              "disabled": disabled,
              "required": required,
              "maxlength": length,
              "change" : component.getReference("c.myAction"),
              "class"	: className
            };
        
        if(type == 'PICKLIST'){
        	config['options'] = helper.createPicklistConfig(picklistValues);
        }

        var componentConfig = [componentName,config];

        newComponentList.push(componentConfig);
		helper.createComponents(component, newComponentList, helper);
	},

	myAction : function(component, event, helper) {
		helper.checkInput(component,helper,true);
		helper.fireChangedFieldEvent(component);
	},

	handleValidationErrorEvent : function(component,event,helper){
		if(!event.getParam("status")){
			helper.checkInput(component,helper,true);
		}
	},
	checkDisabledCondition : function(component,event,helper){
		var params = event.getParam('arguments');
		if (!params) {
			return;
		}

		var item = params.item;
		var property = component.get("v.property");

		var disabledCondition = component.get("v.disabledCondition");
		if(!disabledCondition){
			return;
        }

        var disabled = helper.validateCondition(disabledCondition.condition, item, helper);
        component.find("placeholderItem").get("v.body")[0].set("v.disabled", disabled);
    	if(disabled && disabledCondition.resetOnDisabled === true){
        	component.find("placeholderItem").get("v.body")[0].set("v.value", item.savedObj[property]);
        }

	}
})
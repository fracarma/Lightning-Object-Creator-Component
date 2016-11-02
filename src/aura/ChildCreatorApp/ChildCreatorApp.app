<aura:application access="GLOBAL" extends="ltng:outApp">
	
	<aura:dependency resource="c:ChildCreatorComponent"/>
	<aura:dependency resource="c:ChildCreatorItem"/>
	<aura:dependency resource="c:customInputField"/>
	
	<aura:dependency resource="ui:inputCheckbox"/>
	<aura:dependency resource="ui:inputDateTime"/>
	<aura:dependency resource="ui:inputTextArea"/>
	<aura:dependency resource="ui:inputEmail"/>
	<aura:dependency resource="ui:inputPhone"/>
	<aura:dependency resource="ui:inputText"/>
	

	<aura:dependency resource="ui:outputCheckbox"/>
	<aura:dependency resource="ui:outputDateTime"/>
	<aura:dependency resource="ui:outputTextArea"/>
	<aura:dependency resource="ui:outputEmail"/>
	<aura:dependency resource="ui:outputPhone"/>
	<aura:dependency resource="ui:outputText"/>

	<aura:dependency resource="c:savedItemList" type="EVENT"/>
	<aura:dependency resource="c:removeItem" type="EVENT"/>
	<aura:dependency resource="c:returnItemList" type="EVENT"/>
	<aura:dependency resource="c:validationError" type="EVENT"/>
</aura:application>
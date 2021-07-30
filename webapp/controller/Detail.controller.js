sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment"
], function (Controller, MessageBox, MessageToast, Fragment) {
	"use strict";
	var controller, oModel;
	return Controller.extend("com.mindset.wm.receiving.receiving.controller.Detail", {

		onInit: function () {
			controller = this;
			oModel = controller.getOwnerComponent().getModel();
			controller.router = sap.ui.core.UIComponent.getRouterFor(this);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
		},

		//************** On Route Match of Detail **********************///
		_onObjectMatched: function (oEvent) {
			debugger;
			var IBD = oEvent.getParameter("arguments").IBD;
			var ItemIBD;
				// var RequestType = oEvent.getParameter("arguments").RequestType;
			var FilteredReqType =[];
			
			var ReceivingModel = this.getView().getModel("ReceivingModel");
			// var aFilter = [];

			// aFilter.push(new Filter("RequestId", FilterOperator.EQ, RequestId));
			var Requests = ReceivingModel.getProperty("/Requests");
			var FilteredReq = Requests.filter(function (e) {
				return e.IBD === IBD;
			});
				var FilteredReqItem = FilteredReq[0].Items.filter(
				function (e) {
					return e.IBD === ItemIBD;

				});
			this.getView().getModel("ReceivingModel").setProperty("/FilteredReqType", FilteredReqItem);
			 var IBD =FilteredReq[0].IBD,
			  PO =FilteredReq[0].PO,
			      VendorID  =FilteredReq[0].VendorID,
			    VendorName  = FilteredReq[0].VendorName,
			        Date= FilteredReq[0].Date,
			  ASN  = FilteredReq[0].ASN;
			  ReceivingModel.setProperty("/selectedIBD",IBD);
			  ReceivingModel.setProperty("/selectedPO",PO);
			  ReceivingModel.setProperty("/selectedVendorID",VendorID);
			   ReceivingModel.setProperty("/selectedVendorVendorName",VendorName);
			    ReceivingModel.setProperty("/selectedASN",ASN);
			  ReceivingModel.setProperty("/selectedDate",Date);
			  

			// oModel = this.getView().getModel();
			// if (oEvent && oEvent.getParameter("name") === "detail") {
			// 	oModel.metadataLoaded().then(function () {
			// 		var sObjectPath = this.getView().getModel().createKey("ZFIN_C_BAM_REQUEST", {
			// 			IBD: IBD
			// 		});
			// 		this.getView().bindElement("/" + sObjectPath);
			// 	}.bind(this));
			// }
		},
		/**
		 * Event handler for the reassign event
		 * @param {sap.ui.base.Event} oEvent the reassign event
		 * @private
		 */
		onReassign: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			if (path) {
				this.getView().getModel().setProperty(path + "/Progress", "In Process");
			}
			controller.router.navTo("master");
		},
		/**
		 * Event handler for the reject event
		 * @param {sap.ui.base.Event} oEvent the reject event
		 * @private
		 */
		onReject: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			if (path) {
				this.getView().getModel().setProperty(path + "/Progress", "Rejected");
			}
			controller.router.navTo("master");
		},
		/**
		 * Event handler for the reassign event
		 * @param {sap.ui.base.Event} oEvent the onApprove event
		 * @private
		 */
		onApprove: function (oEvent) {
			var path = oEvent.getSource().getBindingContext().getPath();
			if (path) {
				this.getView().getModel().setProperty(path + "/Progress", "Approved");
			}
			this.onSaveSubmit();
		},
		/**
		 * Event handler for the save event
		 * @param {sap.ui.base.Event} oEvent the save event
		 * @private
		 */
		onSave: function (oEvent) {
			var oObject = oEvent;
			controller = this;
			if (!controller.actionConfirmationDialog) {
				controller.actionConfirmationDialog = new sap.m.Dialog({
					title: "Save or Submit",
					type: "Message",
					content: [
						new sap.m.Label({
							text: "Do you want to save this request?"
						})
					],
					beginButton: new sap.m.Button({
						text: "Confirm",
						press: function () {
							controller.onSaveSubmit(oObject);
							controller.actionConfirmationDialog.close();
							controller.actionConfirmationDialog.destroyContent();
							controller.actionConfirmationDialog = undefined;
						}
					})
				});
				controller.getView().addDependent(controller.actionConfirmationDialog);
			}
			controller.actionConfirmationDialog.open();
		},
		/**
		 * Event handler for the confirm event
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
		onSaveSubmit: function (oEvent) {
			controller.router.navTo("master");
		},
		/**
		 * Event handler for the change event
		 * @param {sap.ui.base.Event} oEvent the change event
		 * @private
		 */
		onChange: function (oEvent) {
			debugger;
			var Id =oEvent.getSource().sId.split("-")[10];
			var path = "/FilteredReqType/"+Id;
			var sproperty = oEvent.getSource().getCustomData()[0].getKey();
			if (path) {
				this.getView().getModel("ReceivingModel").setProperty(path + "/" + sproperty, oEvent.getSource().getSelectedKey());
			}
		},
		/**
		 * Event handler for the popover  event
		 * @param {sap.ui.base.Event} oEvent the popover event
		 * @private
		 */
		handlePopoverPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("com.mindset.fin.PendingRequests.fragment.Popover", this);
				this.getView().addDependent(this._oPopover);
			}
			this._oPopover.openBy(oEvent.getSource());

		},
		/**
		 * Event handler for the close  event
		 * @param {sap.ui.base.Event} oEvent the close event
		 * @private
		 */
		onclosePopOver: function (oEvent) {
			this._oPopover.close();
		},
		onAddMRN: function (oEvent) {
			var oView = this.getView();
			this._Dialog = sap.ui.xmlfragment("com.mindset.wm.receiving.receiving.fragment.AddMRNDialog",
				this);
			oView.addDependent(this._Dialog);
			this._Dialog.open();
		},
		onCancel: function (oEvent) {

			this._Dialog.close();
		},
		onAddItem:function(oEvent){
			debugger
			var documentNumber=sap.ui.getCore().byId("DocumentNumber").getValue();
			if(documentNumber !==""){
					var FilteredReqType = this.getView().getModel("ReceivingModel").getProperty("/FilteredReqType"),
			 newobj =FilteredReqType[0],
			  ReceivingModel =this.getView().getModel("ReceivingModel"),
		    copyObj=jQuery.extend({},newobj);
		    var ItemIBD = copyObj.ItemIBD;
		  
		    FilteredReqType.push(copyObj);
		    var Requests = this.getView().getModel("ReceivingModel").getProperty("/Requests");
		    	var FilteredReq = Requests.filter(function (e) {
				return e.IBD === ItemIBD;
			});
			FilteredReq[0].Items.push(copyObj);
		   ReceivingModel.updateBindings(true);
		   	this._Dialog.close();
		   	sap.ui.getCore().byId("DocumentNumber").setValue("");
		   		this._Dialog.destroy();
				this._Dialog.destroyContent();
			}
			else{
		
				sap.ui.getCore().byId("DocumentNumber").setValueState("Error");
				sap.ui.getCore().byId("DocumentNumber").setValueStateText("Please Enter Document Number");
			
			}
		
		
		    
			
		},
		onDocumentChange:function(oEvent){
				var IBD = sap.ui.getCore().byId("DocumentNumber").getValue();

			if (IBD === "") {
				sap.ui.getCore().byId("DocumentNumber").setValueState("Error");
				sap.ui.getCore().byId("DocumentNumber").setValueStateText("Please Enter Document Number");
			} else {
				sap.ui.getCore().byId("DocumentNumber").setValueState("None");
				sap.ui.getCore().byId("DocumentNumber").setValueStateText("");
			}

			
		},
		onSubmit:function(){
				controller.router.navTo("master");
		},
		onPack:function(){
				var oView = this.getView();
			this._PackDialog = sap.ui.xmlfragment("com.mindset.wm.receiving.receiving.fragment.AddPackDialog",
				this);
			oView.addDependent(this._PackDialog);
			this._PackDialog.open();
			
		},
			onCancelPack: function (oEvent) {

			this._PackDialog.close();
		},
		onSaveHu:function(oEvent){
			this._PackDialog.close();
		},
			onAddRow:function(oEvent){
				debugger
				var ReceivingModel = this.getView().getModel("ReceivingModel");
				var newHU= ReceivingModel.getProperty("/NewHU");
				var obj=newHU[0];
			var copyobj=jQuery.extend({},obj);
			   copyobj.Quantity="";                         
				newHU.push(copyobj);
				ReceivingModel.setProperty("/NewHU",newHU);
				ReceivingModel.updateBindings(true);
				
			
		}
	});
});
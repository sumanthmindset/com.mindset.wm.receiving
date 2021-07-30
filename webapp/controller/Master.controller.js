sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, MessageBox) {
	"use strict";
	var controller;

	return Controller.extend("com.mindset.wm.receiving.receiving.controller.Master", {
		onInit: function () {
			this._oListFilterState = {
				aFilter: []
			};

			controller = this;
			controller.router = sap.ui.core.UIComponent.getRouterFor(this);

		

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var oFilter = new Filter({

					filters: [

						new Filter("IBD", FilterOperator.Contains, sQuery),
						new Filter("PO", FilterOperator.Contains, sQuery),
						new Filter("VendorID", FilterOperator.Contains, sQuery),
						new Filter("VendorName", FilterOperator.Contains, sQuery)

					]

				});
			
				aFilters.push(oFilter);
			}

			// update list binding
			var oList = this.byId("masterList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);

		},

		onOpenViewSettings: function (oEvent) {
			var sDialogTab = "filter";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().getId();
				if (sButtonId.match("sort")) {
					sDialogTab = "sort";
				}
				this.getView().addDependent(this.sDialogTab);
			}

			this.byId("viewSettingsDialog").open(sDialogTab);
		},
		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function (oEvent) {
			var compoundKeys = oEvent.getSource().getSelectedFilterCompoundKeys();
			var oModel = this.getView().getModel();
			// var filterModel = this.getOwnerComponent().getModel("RequestModel");
			var aFilters = [];
			var oRequestRegion = [];
			var oRequestFilter = [];

			// Retreives keys compounded by the `key` value of the ViewSettingsFilterItem
			if (compoundKeys.AssignTo) {
				oModel.setProperty("/AssignTo", Object.keys(compoundKeys.AssignTo));
				Object.keys(compoundKeys.AssignTo).forEach(function (key) {
					oRequestRegion.push(new Filter("AssignTo", FilterOperator.EQ, key));
				});
				var RegionFilter = new Filter({
					filters: oRequestRegion,
					and: false
				});
				aFilters.push(RegionFilter);
			}

			if (compoundKeys.IBANNumber) {
				oModel.setProperty("/IBANNumber", Object.keys(compoundKeys.IBANNumber));
				Object.keys(compoundKeys.IBANNumber).forEach(function (key) {
					oRequestFilter.push(new Filter("IBANNumber", FilterOperator.EQ, key));
				});

				var RequestFilter = new Filter({
					filters: oRequestFilter,
					and: false
				});
				aFilters.push(RequestFilter);
			}

			this._oListFilterState.aFilter = aFilters;
			this.getView().byId("masterList").getBinding("items").filter(aFilters);
			this._applySortGroup(oEvent);
		},
		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */

		_applySortGroup: function (oEvent) {
			var list = this.byId("masterList"),
				mParams = oEvent.getParameters(),
				oBinding = list.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function (oEvent) {
			// var list = this.byId("masterList"),
			var mParams = oEvent.getParameters(),
				// oBinding = list.getBinding("items"),
				aFilters = [];
			for (var i = 0, l = mParams.filterItems.length; i < l; i++) {
				var oItem = mParams.filterItems[i];
				var aSplit = oItem.getKey().split("_");
				var sPath = aSplit[0];
				var vOperator = aSplit[1];
				var vValue1 = aSplit[2];
				var oFilter = new sap.ui.model.Filter(sPath, vOperator, vValue1);
				aFilters.push(oFilter);
			}

		},
		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function (oEvent) {
			debugger;
			var path = oEvent.getSource().getBindingContextPath();
			var selectedIBD = this.getView().getModel("ReceivingModel").getProperty(path).IBD;
		
			controller.router.navTo("detail", {
				IBD: selectedIBD
			});
		},
		/**
		 * Shows the selected item on the detail page
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function (oItem) {

			controller.router.navTo("detail", {
				IBD: oItem.getBindingContext().getObject().IBD
			});
		},

		onAdd: function (oEvent) {
			var oView = this.getView();
			this._Dialog = sap.ui.xmlfragment("com.mindset.wm.receiving.receiving.fragment.NewItemDialog",
				this);
			oView.addDependent(this._Dialog);
			this._Dialog.open();
		},
		dialogAfterclose:function(oEvent){
			this._oDialog.destroy();
			
			
		},
		
		onCancel: function (oEvent) {

			this._Dialog.close();
			this._Dialog.destroy();
				this._Dialog.destroyContent();
		},
		onChange: function (oEvent) {
			var selectedvalue = oEvent.getParameters().value;
			var sproperty = oEvent.getSource().getCustomData()[0].getKey();
			if (selectedvalue) {
				this.getView().getModel("ReceivingModel").setProperty("/" + sproperty, selectedvalue);
			}

		},
		onInChange: function (oEvent) {
			var IBD = sap.ui.getCore().byId("billofLanding").getValue();

			if (IBD === "") {
				sap.ui.getCore().byId("billofLanding").setValueState("Error");
				sap.ui.getCore().byId("billofLanding").setValueStateText("Please Enter Bill of Landing");
			} else {
				sap.ui.getCore().byId("billofLanding").setValueState("None");
				sap.ui.getCore().byId("billofLanding").setValueStateText("");
			}

			// else if (PurchaseOrder !== "") {
			// 	sap.ui.getCore().byId("PurchaseOrder").setValueState("None");
			// 	sap.ui.getCore().byId("PurchaseOrder").setValueStateText("");

			// } else

		},
		onPurchaseChange: function (oEvent) {
			var PurchaseOrder = sap.ui.getCore().byId("PurchaseOrder").getValue();
			if (PurchaseOrder === "") {
			
				sap.ui.getCore().byId("PurchaseOrder").setValueState("Error");
				sap.ui.getCore().byId("PurchaseOrder").setValueStateText("Please Enter Purchase Order");

			} else {
				sap.ui.getCore().byId("PurchaseOrder").setValueState("None");
				sap.ui.getCore().byId("PurchaseOrder").setValueStateText("");
			}

		},
		onDateChange: function (oEvent) {
			var Date = sap.ui.getCore().byId("Date").getValue();
			if (Date === "") {

				sap.ui.getCore().byId("Date").setValueState("Error");
				sap.ui.getCore().byId("Date").setValueStateText("Please Enter Date");

			} else {
				sap.ui.getCore().byId("Date").setValueState("None");
				sap.ui.getCore().byId("Date").setValueStateText("");

			}

		},

		onAddItem: function (oEvent) {
			debugger
			var IBD = sap.ui.getCore().byId("billofLanding").getValue();
			var MeansofTransport = sap.ui.getCore().byId("MeansofTransport").getValue();
			var MeansofTransportID = sap.ui.getCore().byId("MeansofTransportID").getValue();
			var PurchaseOrder = sap.ui.getCore().byId("PurchaseOrder").getValue();
			var Date = sap.ui.getCore().byId("Date").getValue();
			var ExternalID = sap.ui.getCore().byId("ExternalID").getValue();
			if (IBD !== "" & PurchaseOrder !== "" & Date !== "") {
				var ReceivingModel = this.getView().getModel("ReceivingModel");
				var requests = ReceivingModel.getProperty("/Requests");
				var newObj = this.getView().getModel("ReceivingModel").getProperty("/NewObject");

				var copyObj = jQuery.extend({}, newObj);
				copyObj.IBD = IBD;
				copyObj.Items[0].ItemIBD = IBD;
				copyObj.PO = PurchaseOrder;
				copyObj.Date = Date;
				copyObj.Status = "sap-icon://complete";
				copyObj.RecQtyDrop = [{
					"key": "KIT",
					"value": "KIT"
				}, {
					"key": "ROL",
					"value": "ROL"

				}, {
					"key": "EA",
					"value": "EA"

				}];
				// var oModel = this.getView().getModel();
				// oModel.createEntry("/ZFIN_C_BAM_REQUEST",{properties:copyObj});
				// oModel.updateBindings(true);
				// oModel.submitChanges();

				requests.push(copyObj);
				ReceivingModel.setProperty("/Requests", requests);
				// var FilteredReq=	ReceivingModel.getProperty("/FilteredReqType");
				//  FilteredReq[0].Items.push(copyObj);
				ReceivingModel.updateBindings(true);

				this._Dialog.close();
				sap.ui.getCore().byId("billofLanding").setValue("");
					sap.ui.getCore().byId("PurchaseOrder").setValue("");
						sap.ui.getCore().byId("Date").setValue(null);
						sap.ui.getCore().byId("MeansofTransport").setValue("");
					sap.ui.getCore().byId("MeansofTransportID").setValue("");
						sap.ui.getCore().byId("ExternalID").setValue("");
				this._Dialog.destroy();
				this._Dialog.destroyContent();
				

			} else {
				MessageBox.error("Please Enter Mandatory Fields");
					if (IBD === "") {
				sap.ui.getCore().byId("billofLanding").setValueState("Error");
				sap.ui.getCore().byId("billofLanding").setValueStateText("Please Enter Bill of Landing");
			}
			 if (PurchaseOrder === "") {
			
				sap.ui.getCore().byId("PurchaseOrder").setValueState("Error");
				sap.ui.getCore().byId("PurchaseOrder").setValueStateText("Please Enter Purchase Order");

			} 
				if (Date === "") {

				sap.ui.getCore().byId("Date").setValueState("Error");
				sap.ui.getCore().byId("Date").setValueStateText("Please Enter Date");

			} 
			
			}

		
		

		}

	});
});
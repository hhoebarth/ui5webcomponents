import "@ui5/webcomponents/dist/AvatarGroup.js";
import "@ui5/webcomponents-fiori/dist/Bar.js";
import "@ui5/webcomponents/dist/BusyIndicator.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Calendar.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/Carousel.js";
import "@ui5/webcomponents/dist/DatePicker.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Link.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/MessageStrip.js";
import "@ui5/webcomponents-fiori/dist/NotificationListGroupItem.js";
import "@ui5/webcomponents-fiori/dist/NotificationListItem.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents/dist/Popover.js";
import "@ui5/webcomponents/dist/ProgressIndicator.js";
import "@ui5/webcomponents/dist/RatingIndicator.js";
import "@ui5/webcomponents/dist/Switch.js";
import "@ui5/webcomponents/dist/SegmentedButton.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigation.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";
import "@ui5/webcomponents/dist/StandardListItem.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableColumn.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TextArea.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Toast.js";
import "@ui5/webcomponents/dist/ToggleButton.js";
import "@ui5/webcomponents-fiori/dist/UploadCollection.js";

import "@ui5/webcomponents-icons/dist/action-settings.js";
import "@ui5/webcomponents-icons/dist/appointment.js";
import "@ui5/webcomponents-icons/dist/calendar.js";
import "@ui5/webcomponents-icons/dist/chain-link.js";
import "@ui5/webcomponents-icons/dist/disconnected.js";
import "@ui5/webcomponents-icons/dist/edit.js";
import "@ui5/webcomponents-icons/dist/employee.js";
import "@ui5/webcomponents-icons/dist/factory.js";
import "@ui5/webcomponents-icons/dist/group.js";
import "@ui5/webcomponents-icons/dist/history.js";
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/incoming-call.js";
import "@ui5/webcomponents-icons/dist/log.js";
import "@ui5/webcomponents-icons/dist/menu.js";
import "@ui5/webcomponents-icons/dist/nav-back.js";
import "@ui5/webcomponents-icons/dist/navigation-right-arrow.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/status-positive.js";
import "@ui5/webcomponents-icons/dist/sys-find.js";
import "@ui5/webcomponents-icons/dist/sys-help.js";

import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";

import { getTheme, setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { getLanguage, setLanguage } from "@ui5/webcomponents-base/dist/config/Language.js";

import "@ui5/webcomponents-base/dist/features/PropertiesFormatSupport.js";
import { registerI18nBundle, fetchI18nBundle, getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";

import './style.css';

import Logo from './logo.png';

import i18n from './i18n/i18n.properties';
import i18n_de from './i18n/i18n_de.properties';

window.onload = async function() {
	await registerLangBundle();

	fillNotifications();
	
	const busyIndicator = document.getElementById("busy-container");
	busyIndicator.active = true;

	const response = await fetch("https://services.odata.org/V4/Northwind/Northwind.svc/Employees(2)?$format=json&$expand=Employees1,Orders($expand=Customer,Employee,Order_Details)");
	window.employee = await response.json();
	busyIndicator.active = false;

	document.getElementById("shellbar").addEventListener("profile-click", function(event) {
		document.getElementById("popover").openBy(event.detail.targetRef);
	});
	
	document.getElementById("calendar").addEventListener("item-click", function(event) {
		document.getElementById("calendarPopover").openBy(event.detail.targetRef);
	});

	document.querySelectorAll("ui5-messagestrip").forEach(function(messageStrip) {
		messageStrip.addEventListener("close", function() {
			messageStrip.parentNode.removeChild(messageStrip);
		});
	});

	document.getElementById("logo").src = Logo;

	document.getElementById("personalMenu").addEventListener("item-click", function(event) {
		if(event.detail.item.id === "settings")
			document.getElementById("settingsDialog").open();
	});

	document.getElementById("settingsOK").addEventListener("click", function(event) {
		document.getElementById("settingsDialog").close();
		document.getElementById("settingsToast").show();
	});
	
	document.getElementById("language").addEventListener("selection-change", function(event) {
		changeLanguage(event.detail.selectedButton.id);
	});

	const ordersTable = document.getElementById("ordersTable");

	ordersTable.addEventListener("load-more", function() {
		fillOrdersTable(ordersTable, window.orderIndex, window.orderIndex + 10);
	});
	
	bindData();
}

async function fillOrdersTable(ordersTable, fromIndex, toIndex) {
	if(toIndex > window.employee.Orders.length - 1)
	{
		fromIndex = window.employee.Orders.length-11;
		toIndex = window.employee.Orders.length-1;
		ordersTable.hasMore = false;
	}
	else
		ordersTable.hasMore = true;
	
	await fillTotals(fromIndex, toIndex);

	var count = window.orderIndex ? window.orderIndex + toIndex - fromIndex : toIndex - fromIndex;

	ordersTable.loadMoreSubtext = "[" + count + "/" + window.employee.Orders.length + "]";
	window.employee.Orders.slice(fromIndex, toIndex).forEach(order => {	
		const tableRow = document.createElement('ui5-table-row');
		ordersTable.columns.forEach(column => {
			const tableCell = document.createElement('ui5-table-cell');
			var value = resolve(column.id, order);

			tableCell.innerHTML = isDateTime(value)?new Date(value).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }):value;;

			tableRow.appendChild(tableCell);
		});
		ordersTable.appendChild(tableRow);
	});

	window.orderIndex = toIndex;	
}

async function fillTotals(fromIndex, toIndex) {
	await Promise.all(window.employee.Orders.slice(fromIndex, toIndex).map(async (order) => {
		if(!order.Total)
		{
			const responseTotal = await fetch("https://services.odata.org/V4/Northwind/Northwind.svc/Order_Subtotals(" + order.OrderID + ")?$format=json");
			order.Total = await responseTotal.json();
		}	
	}));
}

async function fillNotifications() {
	const productResponse = await fetch("https://services.odata.org/V4/Northwind/Northwind.svc/Products_Above_Average_Prices?$format=json");
	const notifications = await productResponse.json();
	
	const notificationsList = document.getElementById("notifications");
	if(notifications.value.length > 0)
	{
		const notificationGroup = document.createElement('ui5-li-notification-group');	

		notificationGroup.heading = getText("PRICE_NOTIFICATION_HEADER");
		notificationGroup.showClose = true;
		notificationGroup.showCounter = true;
		notificationGroup.priority = "High";
		notificationGroup.collapsed = true;

		notifications.value.forEach(notification => {
			const notificationGroupItem = document.createElement('ui5-li-notification');
			notificationGroupItem.showClose = true;
			notificationGroupItem.heading = getText("PRICE_NOTIFICATION_TEXT", notification.ProductName);

			notificationGroup.appendChild(notificationGroupItem);
		});
		
		notificationsList.appendChild(notificationGroup);
	}
}

function bindData() {
	const headerTitle = document.getElementById('headerTitle');
	headerTitle.innerHTML = employee.FirstName + " " + employee.LastName;
	const headerImage = document.getElementById('headerImage');
	headerImage.image = "data:image/bmp;base64," + employee.Photo.substr(104);
	const headerInitials = document.getElementById('headerInitials');
	headerInitials.initials = employee.FirstName.charAt(0) + employee.LastName.charAt(0);

	const reportsList = document.getElementById('reportsList');
	
	employee.Employees1.forEach(report => {
		const listEntry = document.createElement('ui5-li');
		
		listEntry.image = "data:image/bmp;base64," + report.Photo.substr(104);
		listEntry.description = report.Title;
		listEntry.innerHTML = report.FirstName + " " + report.LastName;

		reportsList.appendChild(listEntry);
	});
	
	for(var key in employee)
		if(employee.hasOwnProperty(key)) {
			var element = document.getElementById(key);	
			if(element)
				if(element.tagName.toLowerCase() === "ui5-link")
					element.innerHTML = employee[key];
				else
					element.value = employee[key];
		}	

	fillOrdersTable(ordersTable, 0, 10);
}

async function registerLangBundle() {
	registerI18nBundle("i18n", {
     	en: i18n,
     	de: i18n_de
 	});

	await fetchI18nBundle("i18n");
}

function getText() {
	return getI18nBundle("i18n").getText(arguments[0], Array.from(arguments).slice(1));
}

window.changeTheme = function(elm) {
	var theme = "sap_fiori_3";
	if(elm.checked)
		theme = "sap_fiori_3_dark";

	if(getTheme() !== theme)
		setTheme(theme);
}

function changeLanguage (language) {
	if(getLanguage() !== language)
		setLanguage(language);
}

function resolve(path, obj) {
    	return path.split('.').reduce(function(prev, curr) {
        	return prev ? prev[curr] : null
    	}, obj || self)
}

function isDateTime(str){
	if(typeof str !== 'string')
		return false;

	var re = new RegExp("^([0-9]{4})-([0-1][0-9])-([0-3][0-9]T[0-2][0-9]:[0-6][0-9]:[0-6][0-9](Z)?)$");
	if(str.match(re)) 
		return true; /* a valid xml dateTime string */
	else 
		return false;
}
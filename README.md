<h2>Selectee: An Angular 1.x jQuery Free replacement for select boxes</h2>

<h3>Installation</h3>
* Download the zip or install it through npm
```
	npm install selectee
```
* Properly link the selectee.js file in your code
```
	<script src="path/to/ng-drift/lib/selectee.js"></script>
	<link rel="stylesheet" type="text/css" href="path/to/ng-drift/lib/selectee.css"/>
```
if you have installed it through npm, it will simply be
```
	<script src="node_modules/selectee/selectee.js"></script>
	<link rel="stylesheet" type="text/css" href="node_modules/selectee/selectee.css"/>
```
* Add 'cambiomarcia.selectee' as a dependency of your app
```
	angular.module('yourApp', ['cambiomarcia.selectee']);
```

<h3>Attributes</h3>
* selectee-options: the array of options available in the select
* ng-model: the model to bind to the selected option
* ng-disabled: an espression that define when the selectee is disabled

When the options are objects, those attributes should be given:
* label-is: the property of the object that has to be used as as the name of the option
* group-by: the name of the property that has to be used to define the group
* full-text: a boolean flag to indicate if the inserted text has to be searched in the entire option or just in the head (default behaviour)

Other default HTML5 attributes are supported: 
* placeholder
* required
* tab-index
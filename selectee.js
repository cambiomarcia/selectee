angular.module('cambiomarcia.selectee', [])
	.directive('selectee', function(){
			return {
				restrict:'E',
				replace: true,
				scope: {
					selecteeOptions: '=',
					toCommit: '=ngModel',
					isDisabled: '=ngDisabled'
				},
				require: 'ngModel',
				template: '<div class="selectee" ng-class="{disabled: isDisabled}">\
								<div class="selectee-input-label">{{::label}}</div>\
								<div class="selectee-input-container">\
									<input type="text" class="selectee-input" ng-model="internal" ng-keyup="filter($event)" ng-keydown="checkClose($event)" ng-focus="open($event)">\
									<div class="selectee-arrow" ng-click="open($event)"></div>\
									<div class="selectee-close" ng-click="close()"></div>\
								</div>\
								<div class="selectee-dropdown">\
									<div class="selectee-option-group">\
										<div ng-repeat-start="filtered in filtered_list track by $index" class="selectee-option-group-label" ng-if="group_by && isNewGroup(filtered)">{{filtered[group_by]}}</div>\
										<div ng-repeat-end class="selectee-option" ng-click="select($index, $event)" ng-class="{highlight: selected_option_counter == $index, active: last_committed === filtered}" >{{label_is ? filtered[label_is] : filtered}}</div>\
									</div>\
								</div>\
							</div>',
				
				link: function(scope, elem, attrs, ngModel){
					scope.filtered_list = scope.selecteeOptions;
					scope.selected_option_counter = -1;
					scope.label_is = attrs['labelIs'];
					scope.group_by = attrs['groupBy'];
					scope.label = attrs['label'];
					if(scope.toCommit) getLabel();
					
					var open = false;
					var search_in = attrs['searchIn'] || attrs['labelIs'];
					var searching_function = attrs['fullText'] ? searchIn : searchAtBegin;
					var input = elem[0].querySelector('input');
					input.placeholder = attrs['placeholder'] || '';

					if(attrs['tabindex']){
						input.tabIndex = attrs['tabindex'];
						elem[0].removeAttribute("tabIndex");
					}

					if(attrs['required'] !== undefined) input.setAttribute("required", attrs['required']);

					var body = document.getElementsByTagName('body')[0];
					var last_scroll;
					var last_group;
					scope.last_committed;

					scope.$watch('selecteeOptions',
						function(newValue, oldValue){
							if(!angular.equals(newValue, oldValue)){
								order();
								filter();
							}

							if(newValue && newValue.indexOf(scope.toCommit) < 0)
								scope.internal = undefined;
						}
					)

					scope.checkClose = function(event){
						if(event.which === 9 || event.which === 13){
							scope.toCommit = scope.selected_option_counter >= 0 ? scope.filtered_list[scope.selected_option_counter] : scope.filtered_list[0];
							scope.close();
							commit();
						}
					}

					scope.filter = function(event){
						if(event.which !== 9 && event.which !== 13)
							switch (event.which){
								case 40: //freccia giù
									scope.selected_option_counter = Math.min(scope.filtered_list.length - 1, scope.selected_option_counter+1);
									getLabel(scope.filtered_list[scope.selected_option_counter]);
									break;
								case 38: 
									scope.selected_option_counter = Math.max(0, scope.selected_option_counter-1);
									getLabel(scope.filtered_list[scope.selected_option_counter]);
									break;
								case 37:
									break;
								case 39:
									break;
								default:
									if(!open) scope.open();
									filter();
									break;
							}
						
					}

					scope.select = function(index, event){
						event.stopPropagation();
						scope.toCommit = scope.filtered_list[index];
						commit();
						scope.close();
					}

					function filter(){
						if(scope.internal && scope.internal !== ''){
							last_group = undefined;
							scope.filtered_list = scope.selecteeOptions.filter(
								function(value){
									if(search_in) return searching_function(value[search_in], scope.internal)
									else return searching_function(value, scope.internal)
								}
							)
						}
						else scope.filtered_list = scope.selecteeOptions;
					}

					scope.isNewGroup = function(elem){
						if(scope.group_by){
							if(elem[scope.group_by] !== last_group){
								last_group = elem[scope.group_by];
								return true;
							}
							else return false;
						}
						else return false;
					}

					scope.open = function(event){
						window.addEventListener(
							'click',
							closeIfIsOutside);
						if(window.innerWidth >= 1200)
							input.focus();

						if(scope.toCommit){
							scope.last_committed = angular.copy(scope.toCommit);
							reset();
						}
						
						open = true;
						elem[0].classList.add('open');
						setScrollable(false, event.type === 'focus');
					}

					scope.close = function(event){
						if(!scope.toCommit && scope.last_committed){
							scope.toCommit = scope.last_committed;
							commit();
						}
						open = false;
						elem[0].classList.remove('open');
						setScrollable();
					}

					function setScrollable(flag, is_focus){
						if(window.innerWidth < 1200){
							if(flag === false){
								if(is_focus) setScroll(0);
								body.classList.add('noscroll');
							}
							else{
								body.classList.remove('noscroll');
								setScroll(last_scroll);
							}
						}
					}

					function reset(){
						scope.toCommit = undefined;
						scope.internal = undefined;
						filter();
					}

					function commit(){
						getLabel();
						ngModel.$setViewValue(scope.toCommit);
					}

					function getLabel(value){
						var setting = value || scope.toCommit;
						if(setting){
							if(scope.label_is) scope.internal = setting[scope.label_is];
							else scope.internal = setting;
						}
						else scope.internal = undefined;
					}

					function setScroll(value){
						last_scroll = document.body.scrollTop;
						setTimeout(
							function(){
								document.body.scrollTop = value;
							},30
						)
					}

					function closeIfIsOutside(event){
						if(event.target !== elem[0] && !isDescendant(elem[0], event.target))
								scope.close();
					}

					function order(){
						if(scope.group_by){
							scope.filtered_list = [];
							var groups = {};
							for (var i in scope.selecteeOptions){
								if(!groups[scope.selecteeOptions[i][scope.group_by]])
									groups[scope.selecteeOptions[i][scope.group_by]] = [];

								groups[scope.selecteeOptions[i][scope.group_by]].push(scope.selecteeOptions[i]);
							}

							for(var key in groups)
								scope.filtered_list = scope.filtered_list.concat(groups[key]);
						}
					}

					function isDescendant(parent, child) {
							var node = child.parentNode;
							while (node != null) {
									if (node == parent) {
												return true;
										}
									node = node.parentNode;
							}
							return false;
					}

					function searchIn(str, term){
						return ((""+str).toLowerCase().indexOf((""+term).toLowerCase()) > -1)
					}

					function searchAtBegin(str, term){
						return ((""+str).toLowerCase().indexOf((""+term).toLowerCase()) === 0)
					}

					scope.$on(
						'$destroy',
						function(){
							window.removeEventListener('click', closeIfIsOutside);
						});

				}
			}
		})
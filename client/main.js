import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Accounts } from 'meteor/accounts-base';

import './main.html';
import '../lib/collections.js';

Session.set('taskLimit', 10);
Session.set('userFilter', false);

Session.set('-')

lastScrollTop = 0;
$(window).scroll(function(event){

	if ($(window).scrollTop() + $(window).height() > $(document).height() - 100){
		var scrollTop = $(this).scrollTop();

		if (scrollTop > lastScrollTop){
			Session.set('taskLimit', Session.get('taskLimit') + 5);			
		}
		lastScrollTop = scrollTop;
	}
});

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY',
});

Template.top.helpers({
	tasksFound(){
  		return todoDB.find({}).count({});
  	},
});

Template.main.helpers({
  	mainAll() {
  		if (Session.get("userFilter") == false){
	  		var time = new Date() - 15000;
	  		var results = todoDB.find({'createdOn': {$gte:time}}).count();

	  		if (results > 0){
	  			return todoDB.find({}, {sort:{createdOn: -1}, limit:Session.get('taskLimit')});
	  		} else {
	    		return todoDB.find({}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
	    	}

    	} else {
    		return todoDB.find({postedBy:Session.get("userFilter")}, {sort:{createdOn: 1}, limit:Session.get('taskLimit')});
    	}  	
  	},

  	taskAge(){
  		var taskCreatedOn = todoDB.findOne({_id:this._id}).createdOn;
  		taskCreatedOn = Math.round((new Date() - taskCreatedOn) / 60000);

  		var unit = " mins";

  		if (taskCreatedOn > 60){
  			taskCreatedOn = Math.round(taskCreatedOn / 60);
  			unit = " hours";
  		}

  		if (taskCreatedOn > 1440){
  			taskCreatedOn = Math.round(taskCreatedOn / 1440);
  			unit = " days";

  		}
  		return taskCreatedOn + unit;
  	},

  	userLoggedIn(){
  		var logged = todoDB.findOne({_id:this._id}).postedBy;
  		var userName = Meteor.users.findOne({_id:logged}).username;
  		console.log(userName);
  		return Meteor.users.findOne({_id:logged}).username;
  	},

  	userId(){
  		return todoDB.findOne({_id:this._id}).postedBy;
  	},

  	isOwner() {
    	return this.owner === Meteor.userId();
    },
});

Template.main.events({
	'click .js-delete'(event, instance){
		var deleteID = this._id;

		var confirmation = confirm("Are you sure you want to delete this");

		if (confirmation == true) {
			$('#' + deleteID).fadeOut('slow','swing', function(){
				todoDB.remove({_id:deleteID});
			});			
		}	
	},

	'click .js-edit'(event, instance){

	},

	'click .usrClick'(event, instance){
		event.preventDefault();
		Session.set("userFilter", event.currentTarget.id);
	},
});

Template.top.events({
	'click .js-submit'(event, instance){
		var Task = $('#newTask').val();

		if (Task == ""){
			Task = "No Task";
		}

		if($('#private').is(':checked')){
			todoDB.insert({'task':Task, 'private':1, 'createdOn':new Date().getTime(), 'postedBy':Meteor.user()._id});
			$("#private").prop("checked", false);
			$("#newTask").val('');
		} else {
			todoDB.insert({'task':Task, 'private':0, 'createdOn':new Date().getTime(), 'postedBy':Meteor.user()._id});
			$("#newTask").val('');
		}
	},
});

Template.editTodo.events({
	'click .js-editSave'(event, instance){
		var Save = this._id;		
		var Todo = $('#changeTodo').val();

		console.log(Save, " ", Todo);

		todoDB.update({_id: Save}, {$set:{'task':Todo, 'createdOn':new Date().getTime()}});

		$('#changeTodo').val('');
		$('#editTodo').modal('hide');
	},
});
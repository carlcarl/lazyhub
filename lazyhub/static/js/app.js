/*jslint browser:true */
/*jslint es5: true */
/*jslint nomen: true */
/*global $, alert, console, require*/

var _, Backbone, Ladda;

require("bootstrap/less/bootstrap.less");
require("ladda/css/ladda.scss");

require("../css/style.css");

_ = require('underscore');
require('bootstrap');
Backbone = require('backbone');
Ladda = require('ladda');

(function () {
    "use strict";

    var App, appView, spinner;


    App = {
        Models: {},
        Views: {},
        Collections: {},
        Templates: {}
    };

    App.Models.Repo = Backbone.Model.extend({
        // Use full_name as the id of each record(repo)
        idAttribute: 'full_name'
    });

    App.Models.Form = Backbone.Model.extend({
        defaults: {
            'error': {
                'account': false,
                'days': false,
            },
            'account': '',
            'days': 100
        },
        validate: function (attributes, options) {
            var account, days, error, msg;
            account = this.attributes.account;
            days = this.attributes.days;
            error = this.attributes.error;
            msg = '';
            if (account === '') {
                error.account = true;
                msg += 'account field error\n';
            } else {
                error.account = false;
            }
            if (days === '' || isNaN(parseInt(days, 10))) {
                error.days = true;
                msg += 'days field error\n';
            } else {
                error.days = false;
            }
            if (error.account || error.days) {
                return msg;
            }
        },
    });

    App.Collections.Repos = Backbone.Collection.extend({
        model: App.Models.Repo,

        initialize: function () {
            // this.formView = null;
        },
        url: function () {
            var account, days, errorClass, inputGroup;
            // TODO: Use other better getter method
            account = this.formModel.attributes.account;
            days = this.formModel.attributes.days;
            return '/' + account + '/' + days;
        },
        parse: function (response) {
            // console.log(response.data);
            return response.data;
        }
    });

    App.Views.Form = Backbone.View.extend({
        el: $('#github-form'),
        template: _.template($('#form-template').html()),
        model: new App.Models.Form(),

        initialize: function () {
            this.render();
        },

        events: {
            'submit': 'submit'
        },

        submit: function (event) {
            event.preventDefault();
            var account, days, error;
            account = this.$('#account').val();
            days = this.$('#days').val();
            this.model.set({
                account: account,
                days: days
            });
            if (this.model.isValid()) {
                this.trigger('query');
            } else {
                console.log(this.model.validationError);
            }
            return false;
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
    });

    App.Views.Alert = Backbone.View.extend({
        el: $('#alert'),
        template: _.template($('#alert-template').html()),
        initialize: function () {
            this.msg = 'Error';
        },
        render: function () {
            var msg;
            // For tiny data, skip using models
            msg = {alert_msg: this.msg};
            this.$el.html(this.template(msg));
            return this;
        },
    });

    App.Views.Filter = Backbone.View.extend({
        el: $('#filter-form'),
        template: _.template($('#filter-template').html()),
        initialize: function () {
        },
        events: {
            'keyup': 'filter',
        },
        filter: function () {
            var mSearch, filterField;
            mSearch = $("#m-search");
            filterField = $('#filter-field').val();
            if (!filterField) {
                mSearch.html('');
            } else {
                mSearch.html('.search-row:not([data-index*="' + filterField + '"]) {display: none;}');
                
            }
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        },
    });

    App.Views.Repo = Backbone.View.extend({
        tagName: 'tr',
        template: _.template($('#repo-template').html()),

        initialize: function (attributes, options) {
            this.animateFlag = options.animateFlag;
        },

        render: function () {
            // console.log(this.model.toJSON());
            this.$el.attr('data-index', this.model.get('full_name'));
            this.$el.addClass('search-row');
            var html = this.$el.html(this.template(this.model.toJSON()));
            this.setElement($(html));
            if (this.animateFlag) {
                this.$el.addClass('animated fadeInDown');
            }
            return this;
        },
    });

    App.Views.Repos = Backbone.View.extend({
        el: $('#repo-table'),
        template: _.template($('#repos-template').html()),

        render: function () {
            var animateFlag, container, filterView;
            this.$el.html(this.template());
            animateFlag = ($(window).width() >= 768);
            container = document.createDocumentFragment();
            filterView = new App.Views.Filter();
            _.each(this.collection.models, function (model, index) {
                model.attributes.counter = index + 1;
                var v = new App.Views.Repo({
                    model: model,
                }, {
                    animateFlag: animateFlag
                });
                container.appendChild(v.render().el);
            }, this);
            this.$el.append(container);
            filterView.render();
            return this;
        },
    });

    App.Views.All = Backbone.View.extend({
        collection: new App.Collections.Repos(),
        el: $('#content'),
        formView: new App.Views.Form(),
        alertView: new App.Views.Alert(),
        spinner: null,

        initialize: function (attributes) {
            this.spinner = Ladda.create(this.$('#submit')[0]);
            _.bindAll(this, 'querySuccess', 'queryError');
            this.collection.bind('request', this.showLoading, this);
            this.collection.bind('sync', this.hideLoading, this);
            this.formView.bind('query', this.query, this);
        },

        query: function (event) {
            var data;
            this.collection.formModel = this.formView.model;
            this.collection.fetch({
                success: this.querySuccess,
                error: this.queryError,
            });
            return false;
        },

        querySuccess: function (collection, response) {
            var errorFlag, prop;
            // console.log(collection);
            // console.log(response);
            errorFlag = false;
            for (prop in response.error) {
                if (response.error.hasOwnProperty(prop)) {
                    this.formView.model.attributes.error[prop] = response.error[prop];
                    errorFlag = errorFlag || response.error[prop];
                }
            }
            if (errorFlag) {
                this.alertView.msg = 'Query fail!';
                this.alertView.render();
                return;
            }
            this.reposView = new App.Views.Repos({
                collection: collection
            });
            this.reposView.render();
        },

        queryError: function (collection, response) {
            this.hideLoading();
            this.alertView.msg = 'Request fail!';
            this.alertView.render();
        },

        showLoading: function () {
            this.spinner.toggle();
        },

        hideLoading: function () {
            this.spinner.toggle();
        },
    });

    appView = new App.Views.All();

}());

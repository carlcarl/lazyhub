/*jslint browser:true */
/*jslint es5: true */
/*jslint nomen: true */
/*global $, _, jQuery, alert, console, Backbone*/
(function ($) {
    "use strict";

    var App, appView;

    App = {
        Models: {},
        Views: {},
        Collections: {},
        Templates: {}
    };

    /*
    csrfToken = $("input[name='csrfmiddlewaretoken']").val();

    Backbone.sync = (function (original) {
        return function (method, model, options) {
            options.beforeSend = function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrfToken);
            };
            original(method, model, options);
        };
    }(Backbone.sync));
    */

    App.Models.Repo = Backbone.Model.extend({
        // Use full_name as the id of each record(repo)
        idAttribute: 'full_name'
    });

    App.Collections.Repos = Backbone.Collection.extend({
        model: App.Models.Repo,
        url: function () {
            var account, days;
            account = $('#account').val();
            days = $('#days').val();
            return '/' + account + '/' + days;
        },
        parse: function (response) {
            console.log(response.data);
            return response.data;
        }
    });

    App.Views.Repo = Backbone.View.extend({
        tagName: 'tr',
        template: _.template($('#repo-template').html()),

        initialize: function (attributes, options) {
            this.animateFlag = options.animateFlag;
        },

        render: function () {
            console.log(this.model.toJSON());
            var html = $(this.el).html(this.template(this.model.toJSON()));
            this.setElement($(html));
            if (this.animateFlag) {
                $(this.el).addClass('animated fadeInDown');
            }
            return this;
        },
    });

    App.Views.Repos = Backbone.View.extend({
        el: $('#repo-table'),
        template: _.template($('#repos-template').html()),

        render: function () {
            var animateFlag;
            animateFlag = ($(window).width() >= 768);
            $(this.el).html(this.template());
            _.each(this.collection.models, function (model, index) {
                model.attributes.counter = index + 1;
                var v = new App.Views.Repo({
                    model: model,
                }, {
                    animateFlag: animateFlag
                });
                $(this.el).append(v.render().$el);
            }, this);
            return this;
        },
    });

    App.Views.All = Backbone.View.extend({
        collection: new App.Collections.Repos(),
        el: $('#content'),

        initialize: function (attributes) {
            this.collection.bind('request', this.showLoading, this);
            this.collection.bind('sync', this.hideLoading, this);
        },

        events: {
            'submit #github-form': 'query'
        },

        query: function (event) {
            var data, that;
            event.preventDefault();
            that = this;
            this.collection.fetch({
                success: function (collection, response) {
                    var errorFlag, errorClass, prop, inputGroup;
                    console.log(collection);
                    console.log(response);
                    errorFlag = false;
                    errorClass = 'has-error';
                    for (prop in response.error) {
                        if (response.error.hasOwnProperty(prop)) {
                            inputGroup = '#' + prop + '-group';
                            if (response.error[prop]) {
                                this.$(inputGroup).addClass(errorClass);
                                errorFlag = true;
                            } else if ($(inputGroup).hasClass(errorClass)) {
                                this.$(inputGroup).removeClass(errorClass);
                            }
                        }
                    }
                    if (errorFlag) {
                        alert('Query fail');
                        console.log('Field error');
                        return;
                    }
                    that.reposView = new App.Views.Repos({
                        collection: collection
                    });
                    that.reposView.render();
                },
                error: function (collection, response) {
                    alert('Request fail');
                }
            });
            return false;
        },

        showLoading: function () {
            this.$('#loading').removeClass('invisible');
            this.$('#submit').prop('disabled', 'disabled');
        },

        hideLoading: function () {
            this.$('#loading').addClass('invisible');
            this.$('#submit').removeAttr('disabled');
        },
    });

    appView = new App.Views.All();

}(jQuery));

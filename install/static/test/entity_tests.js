/*  Authors:
 *    Endi Sukma Dewata <edewata@redhat.com>
 *
 * Copyright (C) 2010 Red Hat
 * see file 'COPYING' for use and warranty information
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; version 2 only
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */

test('Testing ipa_entity_set_search_definition().', function() {

    var uid_callback = function() {
        return true;
    };

    ipa_entity_set_search_definition('user', [
        ['uid', 'Login', uid_callback]
    ]);

    var facet = ipa_entity_get_search_facet('user');
    ok(
        facet,
        'ipa_entity_get_search_facet(\'user\') is not null'
    );

    var column = facet.get_columns()[0];
    ok(
        column,
        'column is not null'
    );

    equals(
        column.name, 'uid',
        'column.name'
    );

    equals(
        column.label, 'Login',
        'column.label'
    );

    ok(
        column.setup,
        'column.setup not null'
    );

    ok(
        column.setup(),
        'column.setup() works'
    );
});

test('Testing ipa_facet_setup_views().', function() {

    var orig_switch_and_show_page = IPA.switch_and_show_page;
    IPA.ajax_options.async = false;

    IPA.init(
        'data',
        true,
        function(data, text_status, xhr) {
            ok(true, 'ipa_init() succeeded.');
        },
        function(xhr, text_status, error_thrown) {
            ok(false, 'ipa_init() failed: '+error_thrown);
        }
    );

    var entity = ipa_entity({
        'name': 'user'
    });

    IPA.add_entity(entity);

    entity.add_facet(ipa_search_facet({
        'name': 'search',
        'label': 'Search'
    }));


    var facet = ipa_association_facet({
        'name': 'associate'
    });
    entity.add_facet(facet);

    var container = $('<div/>');

    var counter = 0;
    IPA.switch_and_show_page = function(entity_name, facet_name, other_entity) {
        counter++;
    };

    facet.setup_views(container);

    //Container now has two divs, one for the action panel one for content
    var list = container.children().last().children();
    var views = list.children();

    equals(
        views.length, 5,
        'Checking number of views'
    );

    facet = views.first();
    ok(  facet.hasClass('entity-search',
        'Checking the search facet'
    );

    facet = facet.next();

    var attribute_members = IPA.metadata['user'].attribute_members;
    for (attribute_member in attribute_members) {
        var objects = attribute_members[attribute_member];
        for (var i = 0; i < objects.length; i++) {
            var object = objects[i];
            equals(
                facet.attr('title'), object,
                'Checking the '+object+' facet'
            );
            facet = facet.next();
        }
    }

    var action_panel = $('.action-panel', container);
    ok(action_panel.length, 'action panel exists');
    var pkey_input =  $('input[name=pkey]', action_panel);
    ok(pkey_input.length,'pkey input exists');
    var search_facets = $('li.search-facet', action_panel);
    equals(search_facets.length,1,'one search facet in action panel');
    var entity_facets = $('li.entity-facet', action_panel);
    equals(entity_facets.length,4,'4 entity facets in action panel');


    for ( var entity_facet = entity_facets.first();
          entity_facet.length;
          entity_facet = entity_facet.next()){
        entity_facet.click();
    }

//    equals(4, counter,'four clicks');

    IPA.switch_and_show_page = orig_switch_and_show_page;
});



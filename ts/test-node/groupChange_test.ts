// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';
import sinon from 'sinon';
import {renderChangeDetail, RenderOptionsType, SmartContactRendererType, StringRendererType} from '../groupChange';
import {GroupV2ChangeDetailType} from '../groups';
import {LocalizerType} from '../types/Util';
// eslint-disable-next-line import/named
import {AccessControlClass, MemberClass} from '../textsecure';

/*
type ChangeRenderDetailTestSpec = {
    input: {
        detail: GroupV2ChangeDetailType,
        options: RenderOptionsType
    }
}
*/

/* Defines each input und expected combination */
/*
const runs: [ChangeRenderDetailTestSpec] = [{
    input: {
        detail: {
            type: 'title',
            newTitle: 'NEWTITLE',
        },
        options: {
            from: 'FROM',
            ourConversationId: 'FROM',
        },
    },
    expect: {
        id: 'GroupV2--title--change--you',
        components: ['NEWTITLE'],
    },
}];
*/

/* */
describe('changeGroup tests', () => {

    // We use one sandbox for our spies
    const sandbox = sinon.createSandbox();

    // We define variables for our spies
    let renderStringSpy: any;
    let renderContactSpy: any;
    let i18nSpy: any;

    beforeEach(() => {

        // Create spies
        renderStringSpy = sinon.spy();
        renderContactSpy = sinon.spy();
        i18nSpy = sinon.spy();
    });

    afterEach(() => {
        sandbox.restore();
    })

    it('with detail.type = create AND from you', () => {

        // Test input
        const detail: GroupV2ChangeDetailType = {
            type: 'create',
        }
        const options: RenderOptionsType = {
            from: 'FROM',
            ourConversationId: 'FROM',
            renderString: <StringRendererType>renderStringSpy,
            renderContact: <SmartContactRendererType>renderContactSpy,
            i18n: <LocalizerType>i18nSpy,
            AccessControlEnum: AccessControlClass.AccessRequired,
            RoleEnum: MemberClass.Role,
        }

        // Call method under test
        renderChangeDetail(detail, options)

        // Verify both spies renderString and renderContact
        assert.isTrue(renderStringSpy.called);
        assert.equal(renderStringSpy.getCall(0).args[0], 'GroupV2--create--you');
    });

    it('with detail.type = create AND not from you', () => {

        // Test input
        const detail: GroupV2ChangeDetailType = {
            type: 'create',
        }
        const options: RenderOptionsType = {
            from: 'FROM',
            ourConversationId: 'OTHER',
            renderString: <StringRendererType>renderStringSpy,
            renderContact: <SmartContactRendererType>renderContactSpy,
            i18n: <LocalizerType>i18nSpy,
            AccessControlEnum: AccessControlClass.AccessRequired,
            RoleEnum: MemberClass.Role,
        }

        // Call method under test
        renderChangeDetail(detail, options)

        // Check render string spy call
        assert.isTrue(renderStringSpy.called);
        assert.equal(renderStringSpy.getCall(0).args[0], 'GroupV2--create--other');
        assert.containsAllKeys(renderStringSpy.getCall(0).args[2], ['memberName'])

        // Check render contact call
        assert.isTrue(renderContactSpy.called)
        assert.isTrue(renderContactSpy.calledWith(options.from))
    });
});

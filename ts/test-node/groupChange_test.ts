// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// import sinon from 'sinon';
import {assert} from 'chai';
// import {renderChangeDetail, RenderOptionsType, SmartContactRendererType,
// StringRendererType} from '../groupChange';
// import {GroupV2ChangeDetailType} from '../groups';
// import {LocalizerType} from '../types/Util';
// import {AccessControlClass, MemberClass} from '../textsecure';

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

describe('Does...', () => {
    it('it work?', () => {
        assert.isTrue(true);
    })
})

/* */
/*
describe('changeGroup tests', () => {

    // We use one sandbox for our spies
    const sandbox = sinon.createSandbox();

    // We define test spies
    const renderStringSpy: any = sandbox.spy();
    const renderContactSpy: any = sandbox.spy();
    const i18nSpy: any = sandbox.spy();

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
        sinon.assert.called(renderStringSpy);
        sinon.assert.calledWith(renderStringSpy, 'GroupV2--create--you');
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
        sinon.assert.called(renderStringSpy);
        sinon.assert.calledWith(renderStringSpy, 'GroupV2--create--other');
        sinon.assert.calledWithMatch(renderStringSpy, sinon.match.has('memberName'))

        // Check render contact call
        sinon.assert.called(renderContactSpy);
        sinon.assert.calledWith(renderContactSpy, options.from);
    });
});
*/
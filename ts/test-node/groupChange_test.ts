// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

// eslint-disable-next-line max-classes-per-file
import sinon from 'sinon';
import {renderChangeDetail, RenderOptionsType, SmartContactRendererType, StringRendererType} from '../groupChange';
import {GroupV2ChangeDetailType} from '../groups';
import {LocalizerType} from '../types/Util';

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

// DANGER those are inline classes of GroupV2Change.stories.tsx
class AccessControlEnum {
    static UNKNOWN = 0;

    static ADMINISTRATOR = 1;

    static ANY = 2;

    static MEMBER = 3;
}

class RoleEnum {
    static UNKNOWN = 0;

    static ADMINISTRATOR = 1;

    static DEFAULT = 2;
}
// DANGER end

/* */
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
            from: 'YOU',
            ourConversationId: 'YOU',
            renderString: <StringRendererType>renderStringSpy,
            renderContact: <SmartContactRendererType>renderContactSpy,
            i18n: <LocalizerType>i18nSpy,
            AccessControlEnum,
            RoleEnum,
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
            from: 'YOU',
            ourConversationId: 'OTHER',
            renderString: <StringRendererType>renderStringSpy,
            renderContact: <SmartContactRendererType>renderContactSpy,
            i18n: <LocalizerType>i18nSpy,
            AccessControlEnum,
            RoleEnum,
        }

        // Call method under test
        renderChangeDetail(detail, options)

        // Check render string spy call
        sinon.assert.called(renderStringSpy);
        sinon.assert.calledWithMatch(renderStringSpy, sinon.match('GroupV2--create--other'), sinon.match(i18nSpy), sinon.match.has('memberName'));

        /*
        // Check render contact call
        sinon.assert.called(renderContactSpy);
        sinon.assert.calledWith(renderContactSpy, options.from);
        */
    });
});

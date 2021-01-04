// Copyright 2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { FullJSXType } from './components/Intl';
import { LocalizerType } from './types/Util';
import { ReplacementValuesType } from './types/I18N';
import { missingCaseError } from './util/missingCaseError';

import { AccessControlClass, MemberClass } from './textsecure.d';
import {
  GroupV2AccessAttributesChangeType, GroupV2AccessMembersChangeType,
  GroupV2AvatarChangeType,
  GroupV2ChangeDetailType,
  GroupV2ChangeType, GroupV2MemberAddChangeType,
  GroupV2TitleChangeType,
} from './groups';

export type SmartContactRendererType = (conversationId: string) => FullJSXType;
export type StringRendererType = (
  id: string,
  i18n: LocalizerType,
  components?: Array<FullJSXType> | ReplacementValuesType<FullJSXType>
) => FullJSXType;

export type RenderOptionsType = {
  AccessControlEnum: typeof AccessControlClass.AccessRequired;
  from?: string;
  i18n: LocalizerType;
  ourConversationId: string;
  renderContact: SmartContactRendererType;
  renderString: StringRendererType;
  RoleEnum: typeof MemberClass.Role;
};

export function renderChange(
  change: GroupV2ChangeType,
  options: RenderOptionsType
): Array<FullJSXType> {
  const { details, from } = change;

  return details.map((detail: GroupV2ChangeDetailType) =>
    renderChangeDetail(detail, {
      ...options,
      from,
    })
  );
}

/**
 * This class resolves given context and parameters to a certain template function call
 * with additional components
 */
class RenderResolver {

  private renderString: StringRendererType;

  private renderContact: SmartContactRendererType;

  private i18n: LocalizerType;

  /** Constructor */
  constructor(renderString: StringRendererType,
              renderContact: SmartContactRendererType,
              i18n: LocalizerType) {
    this.renderString = renderString;
    this.renderContact = renderContact;
    this.i18n = i18n;
  } 

  /** Resolves function call by given detail and context arguments */
  public resolve(detail: GroupV2ChangeDetailType,
                 options: RenderOptionsType) {

    // Parameter extraction
    const {
      from,
      ourConversationId,
      AccessControlEnum,
    } = options;

    // Helper variable
    const fromYou = Boolean(from && from === ourConversationId);

    // 
    if(detail.type === 'create') { return this.groupCreated(from, fromYou); }
    if(detail.type === 'title') { return this.groupTitleChanged(detail, from, fromYou); }
    if(detail.type === 'avatar') { return this.groupAvatarChanged(detail, from, fromYou)}
    if(detail.type === 'access-attributes') { return this.groupAccessAttributesChanged(detail, from, fromYou, AccessControlEnum); }
    if(detail.type === 'access-members') { return this.groupAccessMembersChanged(detail, from, fromYou, AccessControlEnum); }
    if(detail.type === 'member-add') { return this.groupMemberAdded(detail, from, fromYou, ourConversationId); }

    // Else throw an error
    throw new Error('Cannot resolve this')
  }

  /** Call group created render function */
  protected groupCreated (from: string|undefined, fromYou: boolean) {

    // Resolve id suffix
    let suffix = 'unknown';
    if(fromYou) {
      suffix = 'you';
    } else if(from) {
      suffix = 'other';
    }

    // Resolve optional components
    let components;
    if(from) {
      components = {
        memberName: this.renderContact(from),
      }
    }

    // Call render string end return rendered JSX
    return this.renderString(`GroupV2--create--${suffix}`, this.i18n, components);
  }

  /** Call group title changed render function */
  protected groupTitleChanged (detail: GroupV2TitleChangeType, from: string|undefined, fromYou: boolean) {

    const { newTitle } = detail;

    // Resolve from suffix
    let suffix = 'unknown';
    if(fromYou) {
      suffix = 'you';
    } else if(from) {
      suffix = 'other';
    }

    // Resolve mode
    const mode = (newTitle) ? 'change' : 'remove';

    // Resolve optional components
    let components;
    if(newTitle) {
      components = [newTitle]
    } else if(newTitle && fromYou) {
      components = [newTitle]      
    } else if(newTitle && from) {
      components = {
        memberName: this.renderContact(from),
        newTitle,
      }
    }

    // Call render function and return rendered JSX
    return this.renderString(`GroupV2--title--${mode}--${suffix}`, this.i18n, components);
  }

  /** Call group avatar changed renderer function */
  protected groupAvatarChanged(detail: GroupV2AvatarChangeType, from: string|undefined, fromYou: boolean) {

    // Resolve from suffix
    let suffix = 'unknown';
    if(fromYou) {
      suffix = 'you';
    } else if(from) {
      suffix = 'other';
    }

    // Resolve mode
    const mode = (detail.removed) ? 'remove' : 'change';

    // Resolve optional components
    let components;
    if(from) {
      components = [this.renderContact(from)]
    }

    // Call render function and return rendered JSX
    return this.renderString(`GroupV2--avatar--${mode}--${suffix}`, this.i18n, components);
  }

  /** Call access attributes changed renderer function */
  protected groupAccessAttributesChanged(detail: GroupV2AccessAttributesChangeType,
                                         from: string|undefined,
                                         fromYou: boolean,
                                         AccessControlEnum: typeof AccessControlClass.AccessRequired) {
    //
    const { newPrivilege } = detail;

    // Resolve from suffix
    let suffix = 'unknown';
    if(fromYou) {
      suffix = 'you';
    } else if(from) {
      suffix = 'other';
    }

    // Resolve mode
    let mode;
    if(newPrivilege === AccessControlEnum.ADMINISTRATOR) {
      mode = 'admins';
    } else if (newPrivilege === AccessControlEnum.MEMBER) {
      mode = 'all';
    } else {
      throw new Error(`access-attributes change type, privilege ${newPrivilege} is unknown`);
    }

    // Resolve optional components
    let components;
    if(from) {
      components = [this.renderContact(from)]
    }

    // Call renderer function and return rendered JSX
    return this.renderString(`GroupV2--access-attributes--${mode}--${suffix}`, this.i18n, components);
  }

  /** Call access members changed renderer function */
  protected groupAccessMembersChanged(detail: GroupV2AccessMembersChangeType,
                                      from: string|undefined,
                                      fromYou: boolean,
                                      AccessControlEnum: typeof AccessControlClass.AccessRequired) {

    const { newPrivilege } = detail;

    // Resolve from suffix
    let suffix = 'unknown';
    if(fromYou) {
      suffix = 'you';
    } else if(from) {
      suffix = 'other';
    }

    // Resolve mode
    let mode;
    if(newPrivilege === AccessControlEnum.ADMINISTRATOR) {
      mode = 'admins';
    } else if (newPrivilege === AccessControlEnum.MEMBER) {
      mode = 'all';
    } else {
      throw new Error(`access-members change type, privilege ${newPrivilege} is unknown`);
    }

    // Resolve optional components
    let components;
    if(from) {
      components = [this.renderContact(from)]
    }

    // Call renderer function and return rendered JSX
    return this.renderString(`GroupV2--access-members--${mode}--${suffix}`, this.i18n, components);
  }

  /** Call member added renderer function */
  protected groupMemberAdded(detail: GroupV2MemberAddChangeType,
                             from: string|undefined,
                             fromYou: boolean,
                             ourConversationId: string) {

    const { conversationId } = detail;
    const weAreJoiner = conversationId === ourConversationId;

    // Resolve actor
    let actor = 'unknown';
    if(fromYou) {
      actor = 'you';
    } else if(from) {
      actor = 'other';
    }

    // Resolve addee
    const addee = (weAreJoiner) ? 'you' : 'other';

    // Resolve optional components
    let components;
    if (weAreJoiner && from) { components = [this.renderContact(from)]; }
    if (!weAreJoiner && fromYou) { components = [this.renderContact(conversationId)]; }
    if (!weAreJoiner && from) {
      components = {
        adderName: this.renderContact(from),
        addeeName: this.renderContact(conversationId)};
    }

    // Call renderer function and return rendered JSX
    return this.renderString(`GroupV2--member-add--${addee}--${actor}`, this.i18n, components);
  }
}

export function renderChangeDetail(
  detail: GroupV2ChangeDetailType,
  options: RenderOptionsType
): FullJSXType {
  const {
    from,
    i18n,
    ourConversationId,
    renderContact,
    renderString,
    RoleEnum,
  } = options;
  const fromYou = Boolean(from && from === ourConversationId);

  // We use a resolver instance
  const resolver = new RenderResolver(renderString, renderContact, i18n);

  // Try to resolve a render function and return call result
  try {
    return resolver.resolve(detail, options);
  } catch(err) {
    // Dont care and go on..
  }

  /*
  // Group created
  if (detail.type === 'create') {
    if (fromYou) {
      return renderString('GroupV2--create--you', i18n);
    }
    if (from) {
      return renderString('GroupV2--create--other', i18n, {
        memberName: renderContact(from),
      });
    }
    return renderString('GroupV2--create--unknown', i18n);
  }
  */

  /*
  // Group title changed
  if (detail.type === 'title') {
    const { newTitle } = detail;

    if (newTitle) {
      if (fromYou) {
        return renderString('GroupV2--title--change--you', i18n, [newTitle]);
      }
      if (from) {
        return renderString('GroupV2--title--change--other', i18n, {
          memberName: renderContact(from),
          newTitle,
        });
      }
      return renderString('GroupV2--title--change--unknown', i18n, [newTitle]);
    }
    if (fromYou) {
      return renderString('GroupV2--title--remove--you', i18n);
    }
    if (from) {
      return renderString('GroupV2--title--remove--other', i18n, [
        renderContact(from),
      ]);
    }
    return renderString('GroupV2--title--remove--unknown', i18n);
  }
  */

  /*
  // Group avatar removed or changed
  if (detail.type === 'avatar') {
    if (detail.removed) {
      if (fromYou) {
        return renderString('GroupV2--avatar--remove--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--avatar--remove--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--avatar--remove--unknown', i18n);
    }
    if (fromYou) {
      return renderString('GroupV2--avatar--change--you', i18n);
    }
    if (from) {
      return renderString('GroupV2--avatar--change--other', i18n, [
        renderContact(from),
      ]);
    }
    return renderString('GroupV2--avatar--change--unknown', i18n);
  }
  */

  /*
  // Group access attributes 
  if (detail.type === 'access-attributes') {
    const { newPrivilege } = detail;

    if (newPrivilege === AccessControlEnum.ADMINISTRATOR) {
      if (fromYou) {
        return renderString('GroupV2--access-attributes--admins--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--access-attributes--admins--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--access-attributes--admins--unknown', i18n);
    }
    if (newPrivilege === AccessControlEnum.MEMBER) {
      if (fromYou) {
        return renderString('GroupV2--access-attributes--all--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--access-attributes--all--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--access-attributes--all--unknown', i18n);
    }
    throw new Error(
      `access-attributes change type, privilege ${newPrivilege} is unknown`
    );
  }
  */

  /*
  // Group access members
  if (detail.type === 'access-members') {
    const { newPrivilege } = detail;

    if (newPrivilege === AccessControlEnum.ADMINISTRATOR) {
      if (fromYou) {
        return renderString('GroupV2--access-members--admins--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--access-members--admins--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--access-members--admins--unknown', i18n);
    }
    if (newPrivilege === AccessControlEnum.MEMBER) {
      if (fromYou) {
        return renderString('GroupV2--access-members--all--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--access-members--all--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--access-members--all--unknown', i18n);
    }
    throw new Error(
      `access-members change type, privilege ${newPrivilege} is unknown`
    );
  }
  */

  /*
  // Group Member added
  if (detail.type === 'member-add') {
    const { conversationId } = detail;
    const weAreJoiner = conversationId === ourConversationId;

    if (weAreJoiner) {
      if (fromYou) {
        return renderString('GroupV2--member-add--you--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--member-add--you--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--member-add--you--unknown', i18n);
    }
    if (fromYou) {
      return renderString('GroupV2--member-add--other--you', i18n, [
        renderContact(conversationId),
      ]);
    }
    if (from) {
      return renderString('GroupV2--member-add--other--other', i18n, {
        adderName: renderContact(from),
        addeeName: renderContact(conversationId),
      });
    }
    return renderString('GroupV2--member-add--other--unknown', i18n, [
      renderContact(conversationId),
    ]);
  }
  */

  // Group member added from invite
  if (detail.type === 'member-add-from-invite') {
    const { conversationId, inviter } = detail;
    const weAreJoiner = conversationId === ourConversationId;
    const weAreInviter = Boolean(inviter && inviter === ourConversationId);

    if (!from || from !== conversationId) {
      if (weAreJoiner) {
        // They can't be the same, no fromYou check here
        if (from) {
          return renderString('GroupV2--member-add--you--other', i18n, [
            renderContact(from),
          ]);
        }
        return renderString('GroupV2--member-add--you--unknown', i18n);
      }

      if (fromYou) {
        return renderString('GroupV2--member-add--invited--you', i18n, {
          inviteeName: renderContact(conversationId),
        });
      }
      if (from) {
        return renderString('GroupV2--member-add--invited--other', i18n, {
          memberName: renderContact(from),
          inviteeName: renderContact(conversationId),
        });
      }
      return renderString('GroupV2--member-add--invited--unknown', i18n, {
        inviteeName: renderContact(conversationId),
      });
    }

    if (weAreJoiner) {
      if (inviter) {
        return renderString('GroupV2--member-add--from-invite--you', i18n, [
          renderContact(inviter),
        ]);
      }
      return renderString(
        'GroupV2--member-add--from-invite--you-no-from',
        i18n
      );
    }
    if (weAreInviter) {
      return renderString('GroupV2--member-add--from-invite--from-you', i18n, [
        renderContact(conversationId),
      ]);
    }
    if (inviter) {
      return renderString('GroupV2--member-add--from-invite--other', i18n, {
        inviteeName: renderContact(conversationId),
        inviterName: renderContact(inviter),
      });
    }
    return renderString(
      'GroupV2--member-add--from-invite--other-no-from',
      i18n,
      {
        inviteeName: renderContact(conversationId),
      }
    );
  
  // Group member removed
  } else if (detail.type === 'member-remove') {
    const { conversationId } = detail;
    const weAreLeaver = conversationId === ourConversationId;

    if (weAreLeaver) {
      if (fromYou) {
        return renderString('GroupV2--member-remove--you--you', i18n);
      }
      if (from) {
        return renderString('GroupV2--member-remove--you--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--member-remove--you--unknown', i18n);
    }

    if (fromYou) {
      return renderString('GroupV2--member-remove--other--you', i18n, [
        renderContact(conversationId),
      ]);
    }
    if (from && from === conversationId) {
      return renderString('GroupV2--member-remove--other--self', i18n, [
        renderContact(from),
      ]);
    }
    if (from) {
      return renderString('GroupV2--member-remove--other--other', i18n, {
        adminName: renderContact(from),
        memberName: renderContact(conversationId),
      });
    }
    return renderString('GroupV2--member-remove--other--unknown', i18n, [
      renderContact(conversationId),
    ]);

  // Group promoted member privilege
  } else if (detail.type === 'member-privilege') {
    const { conversationId, newPrivilege } = detail;
    const weAreMember = conversationId === ourConversationId;

    if (newPrivilege === RoleEnum.ADMINISTRATOR) {
      if (weAreMember) {
        if (from) {
          return renderString(
            'GroupV2--member-privilege--promote--you--other',
            i18n,
            [renderContact(from)]
          );
        }

        return renderString(
          'GroupV2--member-privilege--promote--you--unknown',
          i18n
        );
      }

      if (fromYou) {
        return renderString(
          'GroupV2--member-privilege--promote--other--you',
          i18n,
          [renderContact(conversationId)]
        );
      }
      if (from) {
        return renderString(
          'GroupV2--member-privilege--promote--other--other',
          i18n,
          {
            adminName: renderContact(from),
            memberName: renderContact(conversationId),
          }
        );
      }
      return renderString(
        'GroupV2--member-privilege--promote--other--unknown',
        i18n,
        [renderContact(conversationId)]
      );
    }
    if (newPrivilege === RoleEnum.DEFAULT) {
      if (weAreMember) {
        if (from) {
          return renderString(
            'GroupV2--member-privilege--demote--you--other',
            i18n,
            [renderContact(from)]
          );
        }
        return renderString(
          'GroupV2--member-privilege--demote--you--unknown',
          i18n
        );
      }

      if (fromYou) {
        return renderString(
          'GroupV2--member-privilege--demote--other--you',
          i18n,
          [renderContact(conversationId)]
        );
      }
      if (from) {
        return renderString(
          'GroupV2--member-privilege--demote--other--other',
          i18n,
          {
            adminName: renderContact(from),
            memberName: renderContact(conversationId),
          }
        );
      }
      return renderString(
        'GroupV2--member-privilege--demote--other--unknown',
        i18n,
        [renderContact(conversationId)]
      );
    }
    throw new Error(
      `member-privilege change type, privilege ${newPrivilege} is unknown`
    );

  // Group added one pending 
  } else if (detail.type === 'pending-add-one') {
    const { conversationId } = detail;
    const weAreInvited = conversationId === ourConversationId;
    if (weAreInvited) {
      if (from) {
        return renderString('GroupV2--pending-add--one--you--other', i18n, [
          renderContact(from),
        ]);
      }
      return renderString('GroupV2--pending-add--one--you--unknown', i18n);
    }
    if (fromYou) {
      return renderString('GroupV2--pending-add--one--other--you', i18n, [
        renderContact(conversationId),
      ]);
    }
    if (from) {
      return renderString('GroupV2--pending-add--one--other--other', i18n, [
        renderContact(from),
      ]);
    }
    return renderString('GroupV2--pending-add--one--other--unknown', i18n);

  // Group added many pending
  } else if (detail.type === 'pending-add-many') {
    const { count } = detail;

    if (fromYou) {
      return renderString('GroupV2--pending-add--many--you', i18n, [
        count.toString(),
      ]);
    }
    if (from) {
      return renderString('GroupV2--pending-add--many--other', i18n, {
        memberName: renderContact(from),
        count: count.toString(),
      });
    }
    return renderString('GroupV2--pending-add--many--unknown', i18n, [
      count.toString(),
    ]);

  // Group removed one pending
  } else if (detail.type === 'pending-remove-one') {
    const { inviter, conversationId } = detail;
    const weAreInviter = Boolean(inviter && inviter === ourConversationId);
    const weAreInvited = conversationId === ourConversationId;
    const sentByInvited = Boolean(from && from === conversationId);
    const sentByInviter = Boolean(from && inviter && from === inviter);

    if (weAreInviter) {
      if (sentByInvited) {
        return renderString('GroupV2--pending-remove--decline--you', i18n, [
          renderContact(conversationId),
        ]);
      }
      if (fromYou) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from-you--one--you',
          i18n,
          [renderContact(conversationId)]
        );
      }
      if (from) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from-you--one--other',
          i18n,
          {
            adminName: renderContact(from),
            inviteeName: renderContact(conversationId),
          }
        );
      }
      return renderString(
        'GroupV2--pending-remove--revoke-invite-from-you--one--unknown',
        i18n,
        [renderContact(conversationId)]
      );
    }
    if (sentByInvited) {
      if (fromYou) {
        return renderString('GroupV2--pending-remove--decline--from-you', i18n);
      }
      if (inviter) {
        return renderString('GroupV2--pending-remove--decline--other', i18n, [
          renderContact(inviter),
        ]);
      }
      return renderString('GroupV2--pending-remove--decline--unknown', i18n);
    }
    if (inviter && sentByInviter) {
      if (weAreInvited) {
        return renderString(
          'GroupV2--pending-remove--revoke-own--to-you',
          i18n,
          [renderContact(inviter)]
        );
      }
      return renderString(
        'GroupV2--pending-remove--revoke-own--unknown',
        i18n,
        [renderContact(inviter)]
      );
    }
    if (inviter) {
      if (fromYou) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from--one--you',
          i18n,
          [renderContact(inviter)]
        );
      }
      if (from) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from--one--other',
          i18n,
          {
            adminName: renderContact(from),
            memberName: renderContact(inviter),
          }
        );
      }
      return renderString(
        'GroupV2--pending-remove--revoke-invite-from--one--unknown',
        i18n,
        [renderContact(inviter)]
      );
    }
    if (fromYou) {
      return renderString('GroupV2--pending-remove--revoke--one--you', i18n);
    }
    if (from) {
      return renderString('GroupV2--pending-remove--revoke--one--other', i18n, [
        renderContact(from),
      ]);
    }
    return renderString('GroupV2--pending-remove--revoke--one--unknown', i18n);
  
  // Group removed many pending
  } else if (detail.type === 'pending-remove-many') {
    const { count, inviter } = detail;
    const weAreInviter = Boolean(inviter && inviter === ourConversationId);

    if (weAreInviter) {
      if (fromYou) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from-you--many--you',
          i18n,
          [count.toString()]
        );
      }
      if (from) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from-you--many--other',
          i18n,
          {
            adminName: renderContact(from),
            count: count.toString(),
          }
        );
      }
      return renderString(
        'GroupV2--pending-remove--revoke-invite-from-you--many--unknown',
        i18n,
        [count.toString()]
      );
    }
    if (inviter) {
      if (fromYou) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from--many--you',
          i18n,
          {
            count: count.toString(),
            memberName: renderContact(inviter),
          }
        );
      }
      if (from) {
        return renderString(
          'GroupV2--pending-remove--revoke-invite-from--many--other',
          i18n,
          {
            adminName: renderContact(from),
            count: count.toString(),
            memberName: renderContact(inviter),
          }
        );
      }
      return renderString(
        'GroupV2--pending-remove--revoke-invite-from--many--unknown',
        i18n,
        {
          count: count.toString(),
          memberName: renderContact(inviter),
        }
      );
    }
    if (fromYou) {
      return renderString('GroupV2--pending-remove--revoke--many--you', i18n, [
        count.toString(),
      ]);
    }
    if (from) {
      return renderString(
        'GroupV2--pending-remove--revoke--many--other',
        i18n,
        {
          memberName: renderContact(from),
          count: count.toString(),
        }
      );
    }
    return renderString(
      'GroupV2--pending-remove--revoke--many--unknown',
      i18n,
      [count.toString()]
    );

  // default case
  } else {
    throw missingCaseError(<never>detail);
  }
}

function appendHtml(el, html) {
  const temp = document.createElement('div');
  temp.style.display = 'none';
  temp.innerHTML = html;
  while (temp.firstChild) {
    el.appendChild(temp.firstChild);
  }
}

function insertBefore(el, html) {
  const temp = document.createElement('div');
  temp.style.display = 'none';
  temp.innerHTML = html;
  while (temp.firstChild) {
    el.parentNode.insertBefore(temp.firstChild, el);
  }
}

const phoneHtml = `
<div class="rc-phone">
    <div class="rc-message">
    </div>
    <div class="rc-actions">
      <button class="rc-schedule-invitation">Schedule Invitation</button>
    </div>
</div>
`;

const meetingInvitation = `
<div aria-label="ringcentral-invitation" dir="1234567" style="border:1px solid #aaaaaa;padding:0;margin:5px 0 0 0;background:#eeeeee;width:600px">
    <div aria-label="ringcentral-invitation-header" style="background:orange;padding:2px 10px;">RingCentral Invitation</div>
    <div aria-label="ringcentral-invitation-content" style="padding:10px">
        <p>Rulee is inviting you to a RingCentral meeting.</p>
        <p>Join from PC, Mac, iOS or Android: <a href="https://rcdev.zoom.us/j/1481393021">https://rcdev.zoom.us/j/1481393021</a></p>
        <br>
        <p>Or iPhone one-tap:</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;(773) 231-9226,,1481393021</p>
        <br>
        <p>Or Telephone:</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;(773) 231-9226</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;Meeting ID: 148 139 3021</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;International numbers available: <a href="https://meetings.ringcentral.com/teleconference">https://meetings.ringcentral.com/teleconference</a></p>
    </div>
</div>
`;

function initPOC() {

  appendHtml(document.body, phoneHtml);

  let richEditor;

  function queryInvitationBlocks() {
    return document.querySelectorAll('[aria-label="ringcentral-invitation"]');
  }

  function cleanInvitationBlocks() {
    const blocks = queryInvitationBlocks();
    blocks.forEach((block) => {
      block.parentNode.removeChild(block);
    });
    showMessage(`${blocks.length} invitation block(s) removed.`);
  }

  function initInvitationBlocks() {
    const blocks = queryInvitationBlocks();
    blocks.forEach((block) => {
      if (!block.getAttribute('contenteditable')) {
        block.setAttribute('contenteditable', 'false');
      }
    });
  }

  const divMessage = document.querySelector('.rc-message');
  function showMessage(message) {
    if (divMessage) {
      const timestamp = (new Date()).toLocaleTimeString();
      divMessage.innerHTML = `<span class="rc-timestamp">${timestamp}</span><p>${message}</p>`;
    }
  }

  const btnScheduleInvitation = document.querySelector('.rc-schedule-invitation');
  if (btnScheduleInvitation) {
    btnScheduleInvitation.addEventListener('click', () => {
      if (richEditor) {
        appendHtml(richEditor, meetingInvitation);
        initInvitationBlocks();
        showMessage('1 invitation block injected');
      }
    });
  }

  function injectRemoveInvitationButton() {
    let removeBtn = document.querySelector('.rc-remove-invitation');
    if (!removeBtn) {
      const ul = document.querySelector('.popupPanel ul');
      insertBefore(ul.children[2], '<li><button class="rc-remove-invitation">Remove Invitation</button></li>');
      removeBtn = document.querySelector('.rc-remove-invitation');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          cleanInvitationBlocks();
        });
      }
    }
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    richEditor = document.querySelector('[role="textbox"][contenteditable="true"]');
    if (!richEditor) {
      showMessage('Calendar details closed');
      return;
    }
    if (!richEditor.getAttribute('rc-binded')) {
      richEditor.setAttribute('rc-binded', 'true');
      initInvitationBlocks();
      injectRemoveInvitationButton();
      showMessage('Calendar details initialized');
    }
  });

  observer.observe(document.body, {
    attributes: false,
    childList: true,
    subtree: false,
  });

  let mouseMoveTimeoutId;
  const throttlingTime = 128;
  const removeCloseDelay = 128;
  function detectCloseButton(ev) {
    clearTimeout(mouseMoveTimeoutId);
    mouseMoveTimeoutId = setTimeout(() => {
      queryInvitationBlocks().forEach((block) => {
        if (block === ev.target || block.contains(ev.target)) {
          clearTimeout(block.removeCloseTimeoutId);
          let closeBtn = block.querySelector('.ringcentral-invitation-close');
          if (!closeBtn) {
            const header = block.querySelector('[aria-label="ringcentral-invitation-header"]');
            appendHtml(header, '<a class="ringcentral-invitation-close">X</a>');
            closeBtn = block.querySelector('.ringcentral-invitation-close');
            closeBtn.addEventListener('click', () => {
              block.parentNode.removeChild(block);
            });
          }
        } else {
          const closeBtn = block.querySelector('.ringcentral-invitation-close');
          if (closeBtn) {
            block.removeCloseTimeoutId = setTimeout(() => {
              closeBtn.parentNode.removeChild(closeBtn);
            }, removeCloseDelay);
          }
        }
      });
    }, throttlingTime);
  }
  document.addEventListener('mousemove', detectCloseButton);
}

window.addEventListener('load', initPOC);

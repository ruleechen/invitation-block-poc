function appendHtml(el, html) {
    var temp = document.createElement('div');
    temp.style.display = 'none';
    document.body.appendChild(temp);
    temp.innerHTML = html;
    while (temp.firstChild) {
        el.appendChild(temp.firstChild);
    }
    document.body.removeChild(temp);
}

const phoneHtml = `
<div class="rc-phone">
    <button class="rc-schedule-meeting">Schedule Meeting</button>
    <br><br>
    <button class="rc-clean-meeting">Clean Meeting</button>
    <div class="rc-message"></div>
</div>
`;

const meetingInvitation = `
<div aria-label="ringcentral-meeting" dir="1234567" style="border:1px solid #aaaaaa;padding:0;background:#eeeeee;" contenteditable="false">
    <div style="background:orange;padding:2px 10px;">RingCentral Meeting Invitation</div>
    <div style="padding:10px">
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

appendHtml(document.body, phoneHtml);

let richEditor;

function queryInvitationBlocks() {
    return document.querySelectorAll('[aria-label="ringcentral-meeting"]');
}

function initInvitationBlock(block) {
    block.setAttribute('contenteditable', 'false');
}

const divMessage = document.querySelector('.rc-message');
function showMessage(message) {
    if (divMessage) {
        const timestamp = (new Date()).toLocaleTimeString();
        divMessage.innerHTML = `<span class="rc-timestamp">${timestamp}</span><p>${message}</p>`;
    }
}

const btnSchedule = document.querySelector('.rc-schedule-meeting');
if (btnSchedule) {
    btnSchedule.addEventListener('click', () => {
        if (richEditor) {
            appendHtml(richEditor, meetingInvitation);
            showMessage('1 Meeting block injected');
        }
    });
}

const btnClean = document.querySelector('.rc-clean-meeting');
if (btnClean) {
    btnClean.addEventListener('click', () => {
        const blocks = queryInvitationBlocks();
        blocks.forEach((block) => {
            block.parentNode.removeChild(block);
        });
        showMessage(`${blocks.length} meeting block(s) removed.`);
    });
}

const observer = new MutationObserver((mutationsList, observer) => {
    richEditor = document.querySelector('[role="textbox"][contenteditable="true"]');
    if (!richEditor) {
        showMessage('Meeting details closed');
        return;
    }
    if (!richEditor.getAttribute('rc-binded')) {
        richEditor.setAttribute('rc-binded', 'true');
        const blocks = queryInvitationBlocks();
        blocks.forEach((block) => {
            initInvitationBlock(block);
        });
        showMessage(`${blocks.length} meeting block(s) found`);
    }
});

observer.observe(document.body, {
    // attributes: true,
    childList: true,
    subtree: true,
});

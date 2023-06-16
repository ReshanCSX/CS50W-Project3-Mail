document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', compose_submit);
  

  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content-view').style.display = 'none';
  document.querySelector('#message').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
      .then(result => 
        {
          email_count = result.length

          // If no emails
          if (email_count == 0){
            document.querySelector('#emails-view').innerHTML = '<div class="col-12 text-bold text-center"> No Emails </div>';
          }

          else{
            
            // Counting element numbers
            count = 0

            // Looping through each element in results
            result.forEach(email => {

              const emails = document.createElement('div');

              // Appending emails inside the div.

              emails.innerHTML = `
                <div class="col-12 col-md-4 text-truncate"> ${email.sender}</div>
                <div class="col-12 col-md-5 text-truncate"> ${email.subject}</div>
                <div class="col-12 col-md-3 small fst-italic text-muted"> ${email.timestamp}</div>
              `;

              // Adding styles to created div
              if(count == (email_count - 1)){
                emails.classList.add('row', 'border','py-3', 'pointer')
              }
              else{
                emails.classList.add('row', 'border', 'border-bottom-0', 'py-3', 'pointer')
              }

              count++
              
              // If email read
              if(email.read){
                emails.classList.add('bg-light')
              }
              
              // Adding event lister to each div click
              emails.addEventListener('click', () => view_email(email.id));

              // Appending div to the container
              document.querySelector('#emails-view').append(emails);
            });

          }

        })
        .catch(error =>{
          console.log(error);
        });
}


async function view_email(email_id){
  
  try{
    const request = await fetch(`/emails/${email_id}`);
    const response = await request.json();


    const email_body = document.querySelector('#email-content-view');

    // Clearing the view
    email_body.style.display = 'block';
    document.querySelector('#message').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    
    // Appending email data to view
    email_body.innerHTML = `
        <div class="row mb-3">
          <div id="email-menu" class="px-0"></div>
        </div>

        <div class="row mb-2 px-0">
          <div class="col-12 col-md-8 ps-0">
            <h3 class="p-0 text-wrap">${response.subject}</h3>
          </div>
          <div class="col-12 col-md-4 px-0 text-muted fst-italic small d-flex align-items-center float-right">${response.timestamp}</div>
        </div>

        <div class="row">
            <div class="col-12 px-0"><span class="text-muted">From:</span> ${response.sender}</div>
        </div>
        <div class="row">
          <div class="col-12 pb-3 border-bottom mb-4 px-0"><span class="text-muted">To:</span>${response.recipients}</div>
        </div>
        <div class="row mb-3 text-muted px-0" style="white-space: pre-line;">${response.body}</div>`;

    // Sending a PUT request if the email is not already read
    if (!response.read){

      try{
        await fetch(`emails/${email_id}`,{
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        });
      }
      catch(error){
        console.log(error);
      }

    }

    // Archive button
    const archive = document.createElement('button');

    archive.classList.add('btn', 'btn-outline-dark');
    archive.innerHTML = '<i class="bi bi-archive"></i> Archive';

    archive.addEventListener('click', async () => archive_email(email_id, response.archived));

    document.querySelector('#email-menu').append(archive);
    
    
    // Reply Button
    
  }
  catch(error){
    console.log(error);
  }

}


async function archive_email(email_id, status) {

  try{

    // PUT archived status
    const test = await fetch(`/emails/${email_id}`,{
      method: 'PUT',
      body: JSON.stringify({
        archived: !status
      })
    });

    // User feedback
    if(!status) {
      load_mailbox('archive')
      message('Email archived successfully.', 'warning')
    }
    else{
      load_mailbox('inbox')
      message('Email unarchived successfully.', 'success')
    }
  }

  catch(error){
    console.log(error)
  }

}


function compose_submit(event) {
  event.preventDefault();

  // Fetch post request to send email
  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error){
      message(result.error, 'danger')
    }
    else{
      load_mailbox('sent')
      message(result.message, 'success')
    }
  })
  .catch(error =>{
    console.log(error);
  });

}


function message(feedback, status){

  const message = document.querySelector('#message')
  message.innerHTML = feedback;
  message.style.display = 'block';
  message.classList.add(`alert-${status}`);
  window.scrollTo(0,0);
}
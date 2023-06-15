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
              
              // Adding event lister to each div click
              emails.addEventListener('click', function (){
                console.log(email.id)
              });

              // Appending div to the container
              document.querySelector('#emails-view').append(emails);
            });

          }

        })
        .catch(error =>{
          console.log(error);
        });
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
      const message = document.querySelector('#message')
      message.innerHTML = result.error;
      message.style.display = 'block';
      message.classList.add("alert-danger");
      window.scrollTo(0,0);
    }
    else{
      load_mailbox('sent')
      message.innerHTML = result.message;
      message.style.display = 'block';
      message.classList.add("alert-success");
    }
  })
  .catch(error =>{
    console.log(error);
  });

}
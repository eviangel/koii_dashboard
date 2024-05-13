let lastUsedTaskID = '';
let lastUsedSpecificAddress = '';


import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";



  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCaZc512rXrJp2unn1Dkysgr5u60n9ifk4",
    authDomain: "koii-dashboard.firebaseapp.com",
    projectId: "koii-dashboard",
    storageBucket: "koii-dashboard.appspot.com",
    messagingSenderId: "558719626294",
    appId: "1:558719626294:web:aec9cfefcf7ba617d37c97",
    measurementId: "G-Z62RH9JDYW"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

document.getElementById('runScript').addEventListener('click', async function(event) {
    event.preventDefault();  // This line prevents the default form behavior
    
    const taskID = document.getElementById('taskID').value;
    //logEvent(analytics, 'button_click', {item: 'test'});

    // Your existing logic
    console.log(taskID);
    const specificAddress = document.getElementById('publicAddress').value;

    // Store for retry usage
    lastUsedTaskID = taskID;
    lastUsedSpecificAddress = specificAddress;

    // Show loading message
    document.getElementById('loading').style.display = 'flex';

    const startTime = Date.now(); // Start timing

    try {
        // Execute main function to get results
        await main(specificAddress, taskID);
        const duration = Date.now() - startTime; // Calculate duration
        // Log the event with duration
        logEvent(analytics, 'button_click', {item: 'run_script_button'});
        // firebase.analytics().logEvent('run_script', {
        //     task_id: taskID,
        //     specific_address: specificAddress,
        //     duration_ms: duration  // duration in milliseconds
        // });
    } catch (error) {
        console.error('Fetch error:', error.message);
        displayErrorMessage(error.message); // Call function to display error message and retry button
        // Also log the error case
        firebase.analytics().logEvent('script_error', {
            task_id: taskID,
            specific_address: specificAddress,
            error_message: error.message
        });
     }
      finally {
        document.getElementById('loading').style.display = 'none';
    }
});


function displayErrorMessage(errorMessage) {
    const errorContainer = document.querySelector('.error-container');
    errorContainer.innerHTML = `
        <p>Error ${errorMessage}</p>
        <button id="retryButton">Retry</button>
    `;
    errorContainer.style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.querySelector('.task-container').style.display = 'none';

    document.getElementById('retryButton').addEventListener('click', function() {
        runScriptFunction();  // This function will retry the last operation
    });
}

function runScriptFunction() {
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('.task-container').style.display = 'block';
    main(lastUsedSpecificAddress, lastUsedTaskID).catch(error => {
        console.error('Fetch error on retry:', error.message);
        displayErrorMessage(error.message); // Update the error message if retry fails
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const tasks = document.querySelectorAll('.task-list .task');

    tasks.forEach(function(taskElement) {
        taskElement.addEventListener('click', function() {
            // First, remove the active class from all tasks
            tasks.forEach(task => task.classList.remove('active'));

            // Add the active class to the clicked task
            this.classList.add('active');

            // Get the text content of the clicked task
            var taskID = this.querySelector('.innerText').textContent;
            // Set the value of the Task ID input field
            document.getElementById('taskID').value = taskID;

            // Optional: Copy the Task ID to clipboard
            navigator.clipboard.writeText(taskID).then(() => {
                console.log('Task ID copied to clipboard');
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
    });
});




async function main(specificAddress, taskID) {
    const { Connection, PublicKey } = require('@_koi/web3.js');
    const connection = new Connection('https://testnet.koii.network');
    
    try {
        const accountInfo = await connection.getAccountInfo(new PublicKey(taskID));
        if (accountInfo === null) {
            throw new Error("Failed to fetch account information.");
        }
        const taskState = JSON.parse(accountInfo.data.toString());
        console.log(taskState);
        // Setting the task name
        document.getElementById('taskName').textContent = taskState.task_name || 'Not available';
        


        
        // Unclaimed rewards
        let unclaimedRewards = 0;
        if (taskState.available_balances && taskState.available_balances[specificAddress]) {
            unclaimedRewards = taskState.available_balances[specificAddress] / 1000000000;
            document.getElementById('unclaimedRewards').textContent = unclaimedRewards.toFixed(2) + ' KOII';
        } else {
            document.getElementById('unclaimedRewards').textContent = 'No data';
        }
        console.log(unclaimedRewards);
        // Staked KOII
        let stakedKoii = 0;
        if (taskState.stake_list && specificAddress in taskState.stake_list) {
            stakedKoii = taskState.stake_list[specificAddress] / 1000000000;
            document.getElementById('stakedKoii').textContent = stakedKoii.toFixed(2) + ' KOII';
        } else {
            document.getElementById('stakedKoii').textContent = 'No data';
        }



       


        // Other details, assuming you have placeholders for them
        document.getElementById('minStake').textContent = taskState.minimum_stake_amount  / 1000000000; // Example static data
        document.getElementById('nodes').textContent = '6.2K'; // Example static data
        document.getElementById('rounds').textContent = '23'; // Example static data
        document.getElementById('roundTime').textContent = taskState.round_time; // Example static data

        document.getElementById('loading').style.display = 'none';

        document.querySelector('.task-container').style.display = 'block';
        

    } catch (error) {
        console.error("Error caught in main execution:", error);
        //document.getElementById('results').textContent = "An error occurred while fetching the data.";
    }
}





document.addEventListener('DOMContentLoaded', function() {
    var closeButton = document.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            var container = this.closest('.task-container');
            if (container) {
                container.style.display = 'none';
            }
        });
    }
});

// Async function to perform operations and update the UI accordingly
// async function main(specificAddress, taskID) {
//     const { Connection, PublicKey } = require('@_koi/web3.js');
//     const connection = new Connection('https://testnet.koii.network');
    
//     try {
//         // Fetch account information
//         const accountInfo = await connection.getAccountInfo(new PublicKey(taskID));
//         if (accountInfo === null) {
//             throw new Error("Failed to fetch account information.");
//         }
//         const taskState = JSON.parse(accountInfo.data.toString());
//         let output = '';
        
//         output += `<p><strong>Task Name = ${taskState.task_name} .</strong></p>`;
//         //output += `<p><strong>Task Name = ${taskState.stake_pot_account} .</strong></p>`;
//         //output += `<p><strong>Stake Pot = ${taskState.stake_pot_account} .</strong></p>`;
//  // Check if the specific address exists in the available_balances
//   if (taskState.available_balances && taskState.available_balances[specificAddress]) {
//     let balance = taskState.available_balances[specificAddress] / 1000000000; // Division by 1,000,000
//     let balanceAsFloat = parseFloat(balance).toFixed(2); // Convert to float and format
//     console.log(`This address ${specificAddress} Has rewards: ${balanceAsFloat}`);
//     output += `<p><strong> Unclaimed rewards for ${specificAddress}:</strong> ${balanceAsFloat} KOII</p>`;
//   } else {
//     console.log(`Address ${specificAddress} not found in available_balances.`);
//     output += `<p><strong>Address ${specificAddress} not found in available_balances.</strong></p>`;
//   }

//   // Check stake_list
//     if (taskState.stake_list && specificAddress in taskState.stake_list) {
//         let stakebalance = taskState.stake_list[specificAddress] / 1000000000; // Division by 1,000,000
//         let StatebalanceAsFloat = parseFloat(stakebalance).toFixed(2); // Convert to float and format
//         console.log(`Stake for ${specificAddress} in stake_list: ${StatebalanceAsFloat}`);
//         output += `<p><strong>Staked Koii for ${specificAddress} in this task:</strong> ${StatebalanceAsFloat} KOII</p>`;
//     } else {
//         console.log(`Address ${specificAddress} not found in stake_list.`);
//         output += `<p><strong>Address ${specificAddress} not found in stake_list.</strong></p>`;
        
//     }
//     output += '</div>';

//     // Check in submissions
//     let foundInSubmissions = false;
//     let rounds = [];
//     for (let [round, submission] of Object.entries(taskState.submissions || {})) {
//         if (submission && submission.hasOwnProperty(specificAddress)) {
//             foundInSubmissions = true;
//             rounds.push(round); // Assuming the round is the key in submissions
//         }
//     }

//     if (foundInSubmissions) {
//         console.log(`Address ${specificAddress} found in submissions in rounds: ${rounds.join(', ')}.`);
//         output +=`Address has submissions in the task in rounds: ${rounds.join(', ')}.`
//     } else {
//         console.log(`Address ${specificAddress} not found in submissions.`);
//         output +=`Address ${specificAddress} not found in submissions.`
//     }
   
//     let lastRound = rounds[rounds.length - 1]; // Get the last round by selecting the last element after sorting
//     output += `<br /> Last round of the task: ${lastRound}`;
//         // You should replace this with your own logic to generate the output based on taskState

//         // Update the results div with the generated output
//         document.getElementById('results').innerHTML = output;
//     } catch (error) {
//         // Log the error to console and show a user-friendly message in the results div
//         console.error(error);
//         document.getElementById('results').innerHTML = "An error occurred while fetching the data.";
//     }
// }


function toggleInfo() {
    var tooltip = document.querySelector('.info-tooltip');
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
}


// document.querySelector('.runScript').addEventListener('click', async function(event) {
//     event.preventDefault(); // Prevent default form submission
//     const taskID = document.getElementById('taskID').value;
//     const specificAddress = document.getElementById('publicAddress').value;
//     await main(specificAddress, taskID);
// });




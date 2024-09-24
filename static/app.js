document.addEventListener('DOMContentLoaded', function () {
    const categorySelect = document.getElementById('category');
    const form = document.getElementById('predictionForm');
    const resultDiv = document.getElementById('result');

    // Fetch categories dynamically from the server
    fetch('/categories')
        .then(response => response.json())
        .then(data => {
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });

    // Handle form submission
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const category = categorySelect.value;
        const month = document.getElementById('month').value;

        if (!category || !month) {
            resultDiv.textContent = 'Please select a category and a month.';
            return;
        }

        const requestData = {
            category: category,
            month: month
        };

        fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                // Clear the resultDiv before updating
                resultDiv.textContent = '';

                // Handle any errors from the response
                if (data.error) {
                    resultDiv.textContent = `Error: ${data.error}`;
                } 
                // Check if the response contains historical sales data
                else if (data.sales_value !== undefined) {
                    resultDiv.textContent = `Historical sales for ${category} in ${month}: ${data.sales_value}`;
                } 
                // Handle predictions
                else if (data.predictions !== undefined) {
                    const predictions = data.predictions;
                    // Join array elements into a readable string if it's a list of future predictions
                    const formattedPredictions = Array.isArray(predictions) ? predictions.join(', ') : predictions;
                    resultDiv.textContent = `Prediction for ${category} in ${month}: ${formattedPredictions}`;
                } 
                else {
                    resultDiv.textContent = 'No data available for the selected month and category.';
                }
            })
            .catch(error => {
                console.error('Error making prediction:', error);
                resultDiv.textContent = 'Error making prediction. Please try again.';
            });
    });
});

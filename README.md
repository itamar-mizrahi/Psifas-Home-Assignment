# Medical Records Service

A service for pulling and analyzing medical records.

## Getting Started

1. Clone the repository.
2. Run `npm install` to install the dependencies.
3. Run `npm start` to start the service.
4. The service will be running on http://localhost:3000.
5. run on postman the url localhost:3000/statistics on POST request for results.

## API
1. GET
localhost:3000/token
/token
To use this call, you will need to include your email address as the "email" query parameter. The
response will include a "Bearer token" which you will need to use to authenticate subsequent
calls.
2. GET
localhost:3000/patients_data_address
/patients_data_address
With this call you can obtain the endpoints to the medical files. It accepts a query parameter
name “offset” (starting at 0), which states the file’s index you wish to obtain.
You should fetch all available files. The files contain medical records of patients in either ICD9 or
ICD10 formats.

3. POST
localhost:3000/statistics
/statistics
This is where you’ll send the data to - please send it in JSON format. Here’s an example:
{
"Syphilitic disseminated retinochoroiditis": 827,
"Disseminated choroiditis and chorioretinitis, posterior pole": 4810,
"Malignant neoplasm of lower lip, inner aspect": 162,
...
}
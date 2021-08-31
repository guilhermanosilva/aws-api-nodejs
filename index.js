const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const randomBytes = require('crypto').randomBytes;

exports.handler = async event => {
  let body;
  let statusCode = 200;
  const now = new Date();
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {

      case "DELETE /leads/{id}":
        await deleteLeadById();
        break;

      case "GET /leads/{id}":
        await getLeadById();
        break;

      case "GET /leads":
        await getLeads();
        break;


      case "PUT /leads/{id}":
        await updateLead();
        break;

      case "PUT /leads":
        await createLead();
        break;

      case "PUT /type":
        await updateLeadType();
        break;

      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  }
  catch (err) {
    statusCode = 400;
    body = err.message;
  }
  finally {
    body = JSON.stringify(body);
  }

  function toUrlString(buffer) {
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async function getLeads() {
    body = await dynamo.scan({ TableName: "leads-corebiz" }).promise();
  }

  async function getLeadById() {
    const leadById = await dynamo.get({
      TableName: "leads-corebiz",
      Key: {
        id: event.pathParameters.id
      }
    })
      .promise();

    if (!leadById.Item) {
      statusCode = 404;
      body = "Lead_not_found";
      return {
        statusCode,
        body
      };
    }

    body = leadById.Item;
    return leadById.Item;
  }

  async function createLead() {
    const requestJSON = JSON.parse(event.body);

    let lead = {
      id: toUrlString(randomBytes(16)),
      name: requestJSON.name,
      email: requestJSON.email,
      phone: requestJSON.phone,
      type: requestJSON.type,
      created_at: now.toISOString(),
      updated_at: null
    };

    await dynamo
      .put({
        TableName: "leads-corebiz",
        Item: lead
      })
      .promise();

    statusCode = 201;
    body = lead;
  }

  async function updateLeadType() {
    const userRequest = JSON.parse(event.body);

    if (!userRequest.email) {
      statusCode = 400;
      body = 'Email not found';
      return {
        statusCode,
        body
      };
    }

    const allLeads = await dynamo.scan({ TableName: "leads-corebiz" }).promise();

    let currentLead = allLeads.Items.filter(lead => lead.email === userRequest.email)[0];

    if (!currentLead) {
      statusCode = 404;
      body = 'Lead not found';
      return {
        statusCode,
        body
      };
    }

    currentLead.type = 'client';
    currentLead.updated_at = now.toISOString();

    await dynamo.put({
      TableName: "leads-corebiz",
      Item: currentLead
    }).promise();
  }

  async function updateLead() {
    let reqLeadUpdate = JSON.parse(event.body);

    let leadToUpdate = await getLeadById();

    if (leadToUpdate.statusCode === 404) {
      return leadToUpdate;
    }

    let dataLead = {
      id: event.pathParameters.id,
      name: reqLeadUpdate.name ? reqLeadUpdate.name : leadToUpdate.name,
      email: reqLeadUpdate.email ? reqLeadUpdate.email : leadToUpdate.email,
      phone: reqLeadUpdate.phone ? reqLeadUpdate.phone : leadToUpdate.phone,
      type: reqLeadUpdate.type ? reqLeadUpdate.type : leadToUpdate.type,
      created_at: leadToUpdate.created_at,
      updated_at: now.toISOString()
    };

    await dynamo.put({
      TableName: "leads-corebiz",
      Item: dataLead
    }).promise();

    body = dataLead;
  }

  async function deleteLeadById() {
    const leadToDelete = await getLeadById();

    if (leadToDelete.statusCode === 404) {
      return {
        leadToDelete
      };
    }

    await dynamo
      .delete({
        TableName: "leads-corebiz",
        Key: {
          id: event.pathParameters.id
        }
      })
      .promise();

    body = event.pathParameters.id;
  }

  return {
    statusCode,
    body,
    headers
  };
};

# AWS Lambda Function para API Gateway

>API REST que lida com o gerenciamento de leads. Desenvolvida em uma única função lambda no AWS, utiliza o bando de dados DynamoDB e API Gateway para genrar a url de acesso aos sistema.

&ensp;

## Endpoints

### Retorna todos do leads
```bash
GET [url]/leads
```
```javascript

response: 

  200: OK
    {
      "Items": [
        {
          "id": "string",
          "name": "string",
          "phone": "string",
          "email": "string",
          "type": "string",
          "updated_at": "string",
          "created_at": "string",
        },
      ]  
    }

```

&ensp;

### Retorna um lead por id
```bash
GET [url]/leads/{id}
```

```javascript

response: 

  200: OK
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "type": "string",
      "updated_at": "string",
      "created_at": "string",
    }

  404: Not Found
    body: 'Lead_not_found'

```

&ensp;

### Adiciona um novo lead
```bash
PUT [url]/leads
```
```javascript

resquest: (JSON)

{
  "name": "string",
  "email": "string",
  "phone": "string"
}

response: 
  
  201: Created
    {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "type": "string",
      "updated_at": "string",
      "created_at": "string",
    }

```

&ensp;

### Atualiza lead por id
```bash
PUT [url]/leads/{id}
```
```javascript

request: (JSON)
  
  {
    "name": "string",
    "email": "string",
    "phone": "string"
  }

response:
  
  200: OK

  404: Not Found
    body: 'Lead_not_found'

```

&ensp;

### Atualiza o type do lead
*Mudar o valor do type para 'client'. Exemplo: `type: 'client'`*
```bash
PUT [url]/type
```
```javascript

request: (JSON) 
  
  {
    "email": "string"
  }

response: 
  
  200: OK

  400: Bad Request
    body: "Email_not_found"

  404: Not Found
    body: "Lead_not_found"

```

&ensp;

### Deleta lead por id
```bash
DELETE [url]/leads/{id}
```

```javascript

response:

  200: OK
    body: "id: string"

  404: Not Found
    body: "Lead_not_Found"

```
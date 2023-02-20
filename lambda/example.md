
curl -X POST 'https://kbnorlxawefgklyeofdm.supabase.co/rest/v1/TacticalCode' \
-H "apikey: SUPABASE_KEY" \
-H "Authorization: Bearer SUPABASE_KEY" \
-H "Content-Type: application/json" \
-H "Prefer: return=minimal" \
-d '{ "some_column": "someValue", "other_column": "otherValue" }'


Bearer is the user's actual session JWT token.
apikey is the key for the Supabase application

{
    "owner": "xxxxxxxx",
    "code" : {

    },
    "name" :"cummy code"
}
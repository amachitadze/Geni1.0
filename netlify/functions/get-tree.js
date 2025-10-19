const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Supabase URL or Key not configured.' }),
      };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('trees')
      .select('tree_data')
      .eq('user_id', user.sub)
      .single();

    // PGRST116: "The result contains 0 rows"
    // This is not an error for us, it means a new user with no data.
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // If no data is found for the user, return null.
    // The frontend will then initialize a default tree for a new user.
    if (!data) {
        return {
            statusCode: 200,
            body: JSON.stringify(null),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.tree_data),
    };

  } catch (error) {
    console.error('Failed to fetch tree data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to fetch tree data', error: error.message }),
    };
  }
};

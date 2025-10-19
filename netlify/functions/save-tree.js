const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

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
    const treeData = JSON.parse(event.body);

    const { error } = await supabase
      .from('trees')
      .upsert({ user_id: user.sub, tree_data: treeData });

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tree data saved successfully' }),
    };
  } catch (error) {
    console.error('Failed to save tree data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to save tree data', error: error.message }),
    };
  }
};

// This function requires a database (e.g., FaunaDB, MongoDB Atlas, Supabase) to persist data.
// See comments in get-tree.js for more details.

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

  try {
    const treeData = JSON.parse(event.body);

    // --- DATABASE INTEGRATION EXAMPLE (e.g., FaunaDB) ---
    //
    // 1. See get-tree.js for client setup.
    // 2. Check if a document for the user already exists.
    //    const userDocExists = await client.query(q.Exists(q.Match(q.Index('trees_by_userId'), user.sub)));
    //
    // 3. If it exists, update it. If not, create a new one.
    //    if (userDocExists) {
    //      await client.query(
    //        q.Update(
    //          q.Select("ref", q.Get(q.Match(q.Index('trees_by_userId'), user.sub))),
    //          { data: { tree: treeData } }
    //        )
    //      );
    //    } else {
    //      await client.query(
    //        q.Create(q.Collection('trees'), {
    //          data: { userId: user.sub, tree: treeData },
    //        })
    //      );
    //    }
    //
    // --------------------------------------------------------

    // MOCK IMPLEMENTATION:
    // In a real app, you would save `treeData` to your database here,
    // associated with the user's ID (`user.sub`).
    console.log(`Simulating save for user ${user.sub}`);

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

import admin from 'firebase-admin';
import { withAuth, withRateLimit } from './middleware/security.js';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
  } catch (error) {
    console.error('Firebase Admin init error in AI API:', error);
  }
}

const db = admin.firestore();

// Translations for standard responses (English, Hindi, Marathi)
const TRANSLATIONS = {
  en: {
    welcome: "Hello! I am your Lumina Customer Support AI. How can I help you today?",
    not_found: "I couldn't find the details you requested.",
    order_status: "The status of your order {orderId} is {status}.",
    order_not_found: "Order {orderId} not found or you do not have permission to view it.",
    support_policy: "Our policy allows returns within 14 days of delivery. Refunds are processed to the original payment method within 5-7 business days.",
    care_tips: "To care for your jewellery, keep it away from chemicals, clean it gently with a soft polishing cloth, and store it in a dry, fabric-lined box.",
    confirm_ticket: "Would you like me to create a support ticket for: '{subject}'?",
    ticket_created: "A support ticket has been created successfully. Ticket ID: {ticketId}.",
    recommend_intro: "Here are some jewellery recommendations for you:",
    fallback: "I'm here to help with order tracking, recommendations, care tips, or raising support tickets. Feel free to ask!",
    confirm_action: "Confirm Action",
    cancel_action: "Cancel",
    please_confirm: "Please confirm if you want me to perform this action:"
  },
  hi: {
    welcome: "नमस्ते! मैं आपका लुमिना ग्राहक सहायता एआई हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    not_found: "मुझे आपके द्वारा अनुरोधित विवरण नहीं मिले।",
    order_status: "आपके ऑर्डर {orderId} की स्थिति {status} है।",
    order_not_found: "ऑर्डर {orderId} नहीं मिला या आपके पास इसे देखने की अनुमति नहीं है।",
    support_policy: "हमारी नीति डिलीवरी के 14 दिनों के भीतर वापसी की अनुमति देती है। रिफंड 5-7 कार्य दिवसों में मूल भुगतान विधि में भेज दिया जाता है।",
    care_tips: "अपने आभूषणों की देखभाल के लिए, उन्हें रसायनों से दूर रखें, मुलायम पॉलिशिंग कपड़े से धीरे से साफ करें, और सूखे बॉक्स में रखें।",
    confirm_ticket: "क्या आप चाहते हैं कि मैं इसके लिए सहायता टिकट बनाऊं: '{subject}'?",
    ticket_created: "सहायता टिकट सफलतापूर्वक बनाया गया है। टिकट आईडी: {ticketId}।",
    recommend_intro: "यहाँ आपके लिए कुछ आभूषणों की सिफारिशें दी गई हैं:",
    fallback: "मैं ऑर्डर ट्रैकिंग, सिफारिशें, देखभाल के टिप्स, या सहायता टिकट बनाने में मदद कर सकता हूँ। कृपया पूछें!",
    confirm_action: "पुष्टि करें",
    cancel_action: "रद्द करें",
    please_confirm: "कृपया पुष्टि करें कि क्या आप चाहते हैं कि मैं यह कार्रवाई करूँ:"
  },
  mr: {
    welcome: "नमस्कार! मी आपला लुमिना ग्राहक सहाय्य एआय आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    not_found: "मला आपण विनंती केलेले तपशील सापडले नाहीत.",
    order_status: "तुमच्या ऑर्डर {orderId} ची स्थिती {status} आहे.",
    order_not_found: "ऑर्डर {orderId} सापडली नाही किंवा ती पाहण्याची परवानगी तुम्हाला नाही.",
    support_policy: "आमचे धोरण डिलिव्हरीच्या 14 दिवसांच्या आत परताव्याची परवानगी देते. परतावा 5-7 व्यावसायिक दिवसांत मूळ पेमेंट पद्धतीमध्ये केला जातो.",
    care_tips: "तुमच्या दागिन्यांची काळजी घेण्यासाठी, त्यांना रसायनांपासून दूर ठेवा, मऊ पॉलिशिंग कापडाने हळूवारपणे स्वच्छ करा आणि कोरड्या बॉक्समध्ये ठेवा.",
    confirm_ticket: "मी यासाठी सहाय्य तिकीट तयार करू का: '{subject}'?",
    ticket_created: "सहाय्य तिकीट यशस्वीरित्या तयार केले गेले आहे. तिकीट आयडी: {ticketId}.",
    recommend_intro: "तुमच्यासाठी काही दागिन्यांच्या शिफारसी येथे आहेत:",
    fallback: "मी ऑर्डर ट्रॅकिंग, शिफारसी, दागिन्यांची काळजी किंवा सहाय्य तिकीट तयार करण्यात मदत करू शकतो. विचारायला अजिबात संकोच करू नका!",
    confirm_action: "नक्की करा",
    cancel_action: "रद्द करा",
    please_confirm: "कृपया खात्री करा की तुम्हाला ही कृती करायची आहे का:"
  }
};

async function handler(req, res) {
  const fullPath = req.query.path || req.body.path || '';
  const cleanPath = Array.isArray(fullPath) ? fullPath.join('/') : fullPath;
  const uid = req.user?.uid;
  const role = req.user?.role || 'customer';

  try {
    // ----------------------------------------------------
    // ROUTE: GET /api/ai/orders/tracking
    // ----------------------------------------------------
    if (cleanPath.startsWith('orders/tracking')) {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
      const { orderId } = req.query;
      if (!orderId) return res.status(400).json({ error: 'Missing orderId parameter' });

      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }
      const orderData = orderDoc.data();
      if (role !== 'superadmin' && orderData.customerId !== uid) {
        return res.status(403).json({ error: 'Unauthorized to view this order tracking' });
      }

      const trackingSnap = await db.collection('delivery_tracking')
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      const checkpoints = [];
      trackingSnap.forEach(doc => checkpoints.push({ id: doc.id, ...doc.data() }));

      return res.status(200).json({
        success: true,
        orderId,
        status: orderData.status,
        checkpoints
      });
    }

    // ----------------------------------------------------
    // ROUTE: GET /api/ai/products/recommendations
    // ----------------------------------------------------
    if (cleanPath.startsWith('products/recommendations')) {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
      const { budget, category, metal, storeId } = req.query;

      let queryRef = db.collection('products');
      if (storeId && storeId !== 'GLOBAL' && storeId !== 'NONE') {
        queryRef = queryRef.where('storeId', '==', storeId);
      }
      if (category) {
        queryRef = queryRef.where('category', '==', category.toLowerCase());
      }
      if (metal) {
        queryRef = queryRef.where('metal', '==', metal.toLowerCase());
      }

      const snap = await queryRef.limit(20).get();
      let list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));

      if (budget) {
        const maxBudget = parseFloat(budget);
        list = list.filter(p => (p.price || 0) <= maxBudget);
      }

      return res.status(200).json({ success: true, recommendations: list.slice(0, 5) });
    }

    // ----------------------------------------------------
    // ROUTE: GET /api/ai/customer/support-summary
    // ----------------------------------------------------
    if (cleanPath.startsWith('customer/support-summary')) {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
      const { storeId } = req.query;

      const ticketsSnap = await db.collection('support_tickets')
        .where('customerId', '==', uid)
        .get();
      
      const tickets = [];
      ticketsSnap.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));

      const ordersSnap = await db.collection('orders')
        .where('customerId', '==', uid)
        .get();
      
      const orders = [];
      ordersSnap.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));

      return res.status(200).json({
        success: true,
        summary: {
          totalTickets: tickets.length,
          activeTickets: tickets.filter(t => t.status === 'open').length,
          recentOrders: orders.slice(0, 5)
        }
      });
    }

    // ----------------------------------------------------
    // ROUTE: POST /api/ai/customer/chat
    // ----------------------------------------------------
    if (cleanPath.startsWith('customer/chat')) {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
      const { chatId, message, language = 'en', storeId = 'DEFAULT', confirmActionId, isCancel } = req.body;

      if (!message && !confirmActionId) {
        return res.status(400).json({ error: 'Missing message or confirmActionId' });
      }

      const lang = ['en', 'hi', 'mr'].includes(language) ? language : 'en';
      const t = TRANSLATIONS[lang];

      // Handle direct confirmations of pending actions
      if (confirmActionId) {
        const actionRef = db.collection('aiActions').doc(confirmActionId);
        const actionDoc = await actionRef.get();
        if (!actionDoc.exists) return res.status(404).json({ error: 'Action not found' });
        const actionData = actionDoc.data();

        if (isCancel) {
          await actionRef.update({ status: 'cancelled' });
          return res.status(200).json({
            success: true,
            response: lang === 'en' ? "Action cancelled." : lang === 'hi' ? "कार्रवाई रद्द कर दी गई।" : "कृती रद्द केली.",
            chatHistory: []
          });
        }

        // Apply action to DB
        let successMessage = "";
        if (actionData.actionType === 'TICKET_CREATE') {
          const ticketRef = db.collection('support_tickets').doc();
          await ticketRef.set({
            ...actionData.details,
            customerId: uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'open',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          });

          await actionRef.update({ status: 'confirmed' });
          successMessage = t.ticket_created.replace('{ticketId}', ticketRef.id.slice(0, 6).toUpperCase());

          // Log Audit
          await db.collection('audit_logs').add({
            action: 'AI_TICKET_CREATE',
            userId: uid,
            role,
            storeId,
            details: { ticketId: ticketRef.id, subject: actionData.details.subject },
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
        }

        return res.status(200).json({
          success: true,
          response: successMessage,
          chatHistory: []
        });
      }

      // 1. Save User Message
      const messageRef = db.collection('aiMessages').doc();
      const userMsgObj = {
        chatId: chatId || 'anonymous',
        sender: 'user',
        text: message,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      await messageRef.set(userMsgObj);

      // 2. Contextual Query Parsing
      const lowercaseMsg = message.toLowerCase();
      let responseText = "";
      let pendingAction = null;

      // 2.1 Track Order Check
      if (lowercaseMsg.includes('track') || lowercaseMsg.includes('order')) {
        const matches = lowercaseMsg.match(/#?[a-z0-9]{15,}/i);
        const extractedId = matches ? matches[0].replace('#', '') : null;

        if (extractedId) {
          const orderDoc = await db.collection('orders').doc(extractedId).get();
          if (orderDoc.exists && (role === 'superadmin' || orderDoc.data().customerId === uid)) {
            responseText = t.order_status.replace('{orderId}', extractedId).replace('{status}', orderDoc.data().status);
          } else {
            responseText = t.order_not_found.replace('{orderId}', extractedId);
          }
        } else {
          // Find latest order for customer
          const latestOrderSnap = await db.collection('orders')
            .where('customerId', '==', uid)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
          
          if (!latestOrderSnap.empty) {
            const latestOrder = latestOrderSnap.docs[0];
            responseText = t.order_status.replace('{orderId}', latestOrder.id).replace('{status}', latestOrder.data().status);
          } else {
            responseText = lang === 'en' ? "Please specify your order ID so I can track it for you." : "कृपया अपना ऑर्डर आईडी निर्दिष्ट करें ताकि मैं इसे आपके लिए ट्रैक कर सकूं।";
          }
        }
      } 
      // 2.2 Recommendation check
      else if (lowercaseMsg.includes('recommend') || lowercaseMsg.includes('suggest') || lowercaseMsg.includes('ring') || lowercaseMsg.includes('necklace') || lowercaseMsg.includes('earring') || lowercaseMsg.includes('gold') || lowercaseMsg.includes('silver') || lowercaseMsg.includes('diamond')) {
        let category = null;
        if (lowercaseMsg.includes('ring')) category = 'rings';
        else if (lowercaseMsg.includes('necklace') || lowercaseMsg.includes('pendant')) category = 'necklaces';
        else if (lowercaseMsg.includes('earring')) category = 'earrings';

        let metal = null;
        if (lowercaseMsg.includes('gold')) metal = 'gold';
        else if (lowercaseMsg.includes('silver')) metal = 'silver';
        else if (lowercaseMsg.includes('platinum')) metal = 'platinum';

        let budget = null;
        const budgetMatches = lowercaseMsg.match(/\d+/g);
        if (budgetMatches) budget = Math.max(...budgetMatches.map(Number));

        let queryRef = db.collection('products');
        if (storeId && storeId !== 'GLOBAL' && storeId !== 'NONE') {
          queryRef = queryRef.where('storeId', '==', storeId);
        }
        if (category) queryRef = queryRef.where('category', '==', category);
        if (metal) queryRef = queryRef.where('metal', '==', metal);

        const snap = await queryRef.limit(5).get();
        let products = [];
        snap.forEach(doc => products.push(doc.data()));
        if (budget) products = products.filter(p => (p.price || 0) <= budget);

        if (products.length > 0) {
          responseText = `${t.recommend_intro}\n` + products.map(p => `- ${p.name}: ₹${p.price.toLocaleString('en-IN')}`).join('\n');
        } else {
          responseText = t.not_found;
        }
      }
      // 2.3 Return / Refund policy check
      else if (lowercaseMsg.includes('return') || lowercaseMsg.includes('refund') || lowercaseMsg.includes('policy')) {
        responseText = t.support_policy;
      }
      // 2.4 Care tips check
      else if (lowercaseMsg.includes('care') || lowercaseMsg.includes('clean') || lowercaseMsg.includes('polish') || lowercaseMsg.includes('dirty')) {
        responseText = t.care_tips;
      }
      // 2.5 Action triggers - Ticket creation
      else if (lowercaseMsg.includes('ticket') || lowercaseMsg.includes('complain') || lowercaseMsg.includes('issue') || lowercaseMsg.includes('problem')) {
        const actionRef = db.collection('aiActions').doc();
        await actionRef.set({
          chatId: chatId || 'anonymous',
          actionType: 'TICKET_CREATE',
          details: {
            subject: message.slice(0, 50) + "...",
            category: lowercaseMsg.includes('refund') ? 'Returns & Refunds' : 'General Inquiry',
            message: message,
            storeId: storeId
          },
          status: 'pending_confirmation',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        pendingAction = {
          actionId: actionRef.id,
          actionType: 'TICKET_CREATE',
          promptText: t.please_confirm + `\n${t.confirm_ticket.replace('{subject}', message.slice(0, 50) + "...")}`
        };
        responseText = t.confirm_ticket.replace('{subject}', message.slice(0, 50) + "...");
      }
      // 2.6 Fallback
      else {
        responseText = t.fallback;
      }

      // Save AI Response Message
      const responseMsgRef = db.collection('aiMessages').doc();
      const responseMsgObj = {
        chatId: chatId || 'anonymous',
        sender: 'agent',
        text: responseText,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      };
      await responseMsgRef.set(responseMsgObj);

      return res.status(200).json({
        success: true,
        response: responseText,
        pendingAction
      });
    }

    return res.status(404).json({ error: 'AI API route not found' });

  } catch (error) {
    console.error(`AI API failed:`, error);
    return res.status(500).json({ error: error.message });
  }
}

export default withAuth(withRateLimit(handler, 60, 60000));

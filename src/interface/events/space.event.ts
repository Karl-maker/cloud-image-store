import { PAYMENT_INTENT_SUCCEEDED } from "../../domain/constants/event.names";
import { PaymentIntentSucceededPayload } from "../../domain/types/webhook";
import { eventBus } from "../../infrastructure/event/event.bus";

eventBus.on<PaymentIntentSucceededPayload>(PAYMENT_INTENT_SUCCEEDED, async (payload : PaymentIntentSucceededPayload) => {

    try { 

        
    } catch(err) {


    }

});
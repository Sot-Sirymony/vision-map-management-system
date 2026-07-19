package com.visionmapping.service.support;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class UserCacheEvictorTest {

    private final UserCacheEvictor evictor = new UserCacheEvictor();

    @AfterEach
    void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void generationIsStableUntilEvictedAndIndependentPerUser() {
        long userOne = evictor.generation(1L);
        long userTwo = evictor.generation(2L);
        assertEquals(userOne, evictor.generation(1L));

        evictor.evictAll(1L);

        assertTrue(evictor.generation(1L) > userOne, "eviction must advance the generation");
        assertEquals(userTwo, evictor.generation(2L), "other users' generations must not move");
    }

    @Test
    void evictionInsideTransactionTakesEffectOnlyAtCommit() {
        TransactionSynchronizationManager.initSynchronization();
        long before = evictor.generation(1L);

        evictor.evictAll(1L);
        assertEquals(before, evictor.generation(1L),
                "a bump before commit would let concurrent reads cache pre-commit data under the new generation");

        for (TransactionSynchronization synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            synchronization.afterCommit();
        }
        assertTrue(evictor.generation(1L) > before, "commit must advance the generation");
    }
}

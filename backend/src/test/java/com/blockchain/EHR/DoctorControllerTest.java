package com.blockchain.EHR;

import com.blockchain.EHR.controller.DoctorController;
import com.blockchain.EHR.jwt.JwtUtils;
import com.blockchain.EHR.model.EhrDocument;
import com.blockchain.EHR.model.PatientStatus;
import com.blockchain.EHR.model.Pending;
import com.blockchain.EHR.services.DoctorService;
import com.blockchain.EHR.services.EhrService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DoctorController.class)
@AutoConfigureMockMvc(addFilters = false)
class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.blockchain.EHR.repository.PatientRepository patientRepository;
    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private DoctorService doctorService;
    @MockBean
    private com.blockchain.EHR.repository.PendingRepository pendingRepository;
    @MockBean
    private EhrService ehrService;

    private final String jwt = "mocked-jwt";
    private final String did = "doctor1";
    private final String mspId = "Org1MSP";

    private void mockJwt() {
        Mockito.when(jwtUtils.getJwtFromHeader(any())).thenReturn(jwt);
        Mockito.when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(did);
        Mockito.when(jwtUtils.getMspIdFromJwtToken(jwt)).thenReturn(mspId);
    }

    @Test
    @DisplayName("POST /fabric/doctor/add-request")
    void testAddRequest() throws Exception {
        mockJwt();
        mockMvc.perform(post("/fabric/doctor/add-request")
                .param("pid", "patient1")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(doctorService).addRequest(eq(did), eq("patient1"));
    }

    @Test
    @DisplayName("GET /fabric/doctor/patients")
    void testGetAllPatients() throws Exception {
        mockJwt();
        List<PatientStatus> statuses = Collections.singletonList(new PatientStatus());
        Mockito.when(doctorService.getPatientStatus(eq(did), eq(mspId))).thenReturn(statuses);

        mockMvc.perform(get("/fabric/doctor/patients")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(doctorService).getPatientStatus(eq(did), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/doctor/view-ehr")
    void testViewEhr() throws Exception {
        mockJwt();
        EhrDocument ehrDocument = new EhrDocument();
        Mockito.when(ehrService.getEhrDocument(eq("patient1"), eq(did), eq(mspId))).thenReturn(ehrDocument);

        mockMvc.perform(get("/fabric/doctor/view-ehr")
                .param("patientId", "patient1")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(ehrService).getEhrDocument(eq("patient1"), eq(did), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/doctor/requests")
    void testGetAllRequests() throws Exception {
        mockJwt();
        List<Pending> pendings = Collections.singletonList(new Pending());
        Mockito.when(pendingRepository.findAllByDid(eq(did))).thenReturn(pendings);

        mockMvc.perform(get("/fabric/doctor/requests")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(pendingRepository).findAllByDid(eq(did));
    }

    @Test
    @DisplayName("POST /fabric/doctor/update-ehr")
    void testUpdateEhr() throws Exception {
        mockJwt();
        EhrDocument updatedEhr = new EhrDocument();
        Mockito.when(ehrService.updateEhr(eq(did), eq("patient1"), eq(mspId), any(EhrDocument.class))).thenReturn(true);

        mockMvc.perform(post("/fabric/doctor/update-ehr")
                .param("patientId", "patient1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(ehrService).updateEhr(eq(did), eq("patient1"), eq(mspId), any(EhrDocument.class));
    }
}

package com.blockchain.EHR.services;

import com.blockchain.EHR.model.PatientStatus;
import com.blockchain.EHR.model.Pending;
import com.blockchain.EHR.repository.PatientRepository;
import com.blockchain.EHR.repository.PendingRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DoctorService {
    @Autowired
    private PendingRepository pendingRepository;
    @Autowired
    private FabricService fabricService;
    @Autowired
    private PatientRepository patientRepository;

    public List<PatientStatus> getPatientStatus(String did,String mspId) throws JsonProcessingException {
           List<PatientStatus> patientStatuses = new ArrayList<>();
        List<Pending> pendingList = pendingRepository.findAllByDid(did);
        for(Pending pending : pendingList) {
            if (pending.getStatus().equals("Accepted")){
                PatientStatus patientStatus = new PatientStatus();
            patientStatus.setPid(pending.getPid());
            patientStatus.setStatus(pending.getStatus());
            patientStatuses.add(patientStatus);
            }
        }
        return patientStatuses;

    }

    public void addRequest(String did,String pid){
        Pending pendingExists = pendingRepository.findByPidAndDid(pid,did);
        if(pendingExists==null) {
            Pending pending = new Pending();
            pending.setPid(pid);
            pending.setDid(did);
            pending.setStatus("Requested");
            pendingRepository.save(pending);
        }else{
            pendingExists.setStatus("Requested");
            pendingRepository.save(pendingExists);
        }
    }

    public boolean addAccess(String did,String pid,String hash,String mspId){
        String[] args = {pid,did};
        String response = fabricService.submitTransaction("mychannel","ehr","getEHRRecord",args,did,mspId);
        LocalDateTime now = LocalDateTime.now();
        String formatted = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        if(response.startsWith("Transaction"))
            return false;
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response);
            if(rootNode.path("status").asText().equals("active")){
                String[] access = {did,pid,hash, formatted};
                String accessResponse = fabricService.submitTransaction("mychannel","ehr","recordAccess",access,did,mspId);
                return !accessResponse.startsWith("Transaction");
            }else{
                return false;
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean addUpdate(String did,String pid,String hash,String mspId){
        String[] args = {pid,did};
        String response = fabricService.submitTransaction("mychannel","ehr","getEHRRecord",args,did,mspId);
        if(response.startsWith("Transaction"))
            return false;
        try{
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(response);
            if(rootNode.path("status").asText().equals("active")){
                if(rootNode.get("status").toString().equals("active")) {
                    return false;
                }
                LocalDateTime now = LocalDateTime.now();
                String formatted = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                String[] access = {did,pid,hash, formatted};

                String accessResponse = fabricService.submitTransaction("mychannel","ehr","updateEHRRecord",access,did,mspId);
                return !accessResponse.startsWith("Transaction");
            }else{
                return false;
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
